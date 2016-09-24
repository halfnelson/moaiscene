local rx = require('rx')
local u = require('tableutil')
--editor bootstrap
MOAISim.openWindow ( "test", 300, 300 ) --needed but doesn't do anything now


  
Scene = {
  layers = {},
  props = {},
  decks = {},
  resources = {}
}


Selection = {}
local selection_mt = { __index = Selection }
function Selection.new()
  local obj = {}
  setmetatable(obj, selection_mt)
  return obj
end




Editor = {
  viewport = MOAIViewport.new (),
  camera = MOAICamera2D.new (),
  layer = MOAILayer2D.new(),
  selection = {}
}
Editor.layer:setViewport(Editor.viewport)
Editor.layer:setCamera(Editor.camera)
 
function Editor:clearSelection()
  Editor.selection = {}
end

function Editor:deselect(prop)
  Editor.selection = u.ipairs():filter(function(v) return v ~= prop end):toArray(Editor.selection)
end

local gfxQuad = MOAIGfxQuad2D.new ()
gfxQuad:setTexture ( "moai.png" )
gfxQuad:setRect ( -64, -64, 64, 64 )
gfxQuad.name = "TestQuad"


function Editor:getEditorPoint(layer, x, y, z)
    return self.layer:wndToWorld(layer:worldToWnd(x,y,z))
end


function Editor:getEditorCorners(prop, layer)
  local a0,b0,c0,a1,b1,c1 = prop:getBounds()
  
  local x0,y0,z0 = prop:modelToWorld(a0,b0,0)
  local x1,y1,z1 = prop:modelToWorld(a1,b0,0)
  local x2,y2,z2 = prop:modelToWorld(a1,b1,0)
  local x3,y3,z3 = prop:modelToWorld(a0,b1,0)
  
  x0,y0,z0 = self:getEditorPoint(layer, x0, y0, z0)
  x1,y1,z1 = self:getEditorPoint(layer, x1, y1, z1)
  x2,y2,z2 = self:getEditorPoint(layer, x2, y2, z2)
  x3,y3,z3 = self:getEditorPoint(layer, x3, y3, z3)
  
  return x0,y0,z0, x1,y1,z1, x2,y2,z2, x3,y3,z3  
end


function Editor:select(prop, layer) 
  
  local pin = MOAIPinTransform.new()
  pin:init( layer, self.layer)
  pin:setNodeLink( prop )
  
  
  local selectionProp = MOAIProp2D.new()
  selectionProp:setAttrLink(MOAITransform.INHERIT_LOC, pin, MOAITransform.TRANSFORM_TRAIT)
  selectionProp:setAttrLink(MOAITransform.ATTR_Z_ROT, prop, MOAITransform.ATTR_Z_ROT)
  
  
  local scriptdeck = MOAIScriptDeck.new()
  scriptdeck:setRect(0,0,1,1) --not sure why this is needed for scriptdeck? does it help with font or something?
  
  scriptdeck:setDrawCallback(function() 
        -- Find our props rect on our gui layer
        local x0,y0,z0,x1,y1,z1,x2,y2,z2,x3,y3,z3 = self:getEditorCorners(prop, layer)
        x0,y0,z0 = selectionProp:worldToModel(x0, y0, z0)
        x1,y1,z1 = selectionProp:worldToModel(x1, y1, z1)
        x2,y2,z2 = selectionProp:worldToModel(x2, y2, z2)
        x3,y3,z3 = selectionProp:worldToModel(x3, y3, z3)
        -- box it
        MOAIGfxDevice.setPenColor(0.8, 0, 0.8, 0.8)
        local width = 2
        MOAIDraw.fillRect(x0-width, y0, x1+width, y1-width)
        MOAIDraw.fillRect(x1, y1-width, x2+width, y2+width)
        MOAIDraw.fillRect(x2+width, y2, x3-width, y3+width)
        MOAIDraw.fillRect(x3, y3+width, x0-width, y0-width)
      end)
  
  selectionProp:setDeck(scriptdeck)
  
  self.layer:insertProp(selectionProp)
 
  table.insert(self.selection, prop)
end
  


-- one main gui viewport


function refreshViewport()
  
    Editor.viewport:setSize ( MOAIEnvironment.horizontalResolution,  MOAIEnvironment.verticalResolution )
    Editor.viewport:setScale ( MOAIEnvironment.horizontalResolution, MOAIEnvironment.verticalResolution )
  -- viewport:setOffset(-1,1)
end

refreshViewport()

MOAIRenderMgr.setRenderTable({
    Scene.layers,
    Editor.layer
})








table.insert(Scene.decks, gfxQuad)

local sceneViewport = MOAIViewport.new()

sceneViewport:setSize (MOAIEnvironment.horizontalResolution,  MOAIEnvironment.verticalResolution  )
sceneViewport:setScale ( MOAIEnvironment.horizontalResolution*2, MOAIEnvironment.verticalResolution*2 )

local layer = MOAILayer2D.new ()
layer.name = "Main"
layer:setViewport ( sceneViewport )
layer:setCamera( Editor.camera )
table.insert(Scene.layers, layer)

local prop = MOAIProp2D.new ()
prop:setDeck ( gfxQuad )
prop.name = "prop1"
prop.parent = layer


layer:insertProp ( prop )

table.insert(Scene.props, prop)









local Scheduler = rx.CooperativeScheduler.create(0)
local schedulerThread = MOAICoroutine:new()
local lastStep = MOAISim:getElapsedTime()

schedulerThread:run(function() 
  local now = MOAISim:getElapsedTime()
  local delta = now - lastStep
  Scheduler:update(delta)
end)


--setup our subjects
local function propForPoint(x,y)
  
  --search all layers
  for _,layer in ipairs(Scene.layers) do
    local mx,my = layer:wndToWorld(x,y)
    local p = layer:getPartition():propForPoint(mx,my)
    if p then return p, layer end
  end
  return false
end



LeftMouse = rx.Subject.create()
function onMouseLeftEvent ( down )
    local x, y = MOAIInputMgr.device.pointer:getLoc()
    LeftMouse:onNext( down, x, y  )
end
MOAIInputMgr.device.mouseLeft:setCallback ( onMouseLeftEvent )

MousePos = rx.Subject.create()
function onMouseMoveEvent( x, y )
    MousePos:onNext( x, y )
end
MOAIInputMgr.device.pointer:setCallback( onMouseMoveEvent )

LeftMouseDown = LeftMouse:filter(function(down) return down end)
LeftMouseUp = LeftMouse:filter(function(down) return not down end)


MouseDeltas = MousePos:pack():skip(1):zip(MousePos:pack()):map(function(newpos, oldpos) return newpos[1] - oldpos[1], newpos[2] - oldpos[2] end)

local function checkKey ( key )
  return MOAIInputMgr.device.keyboard:keyIsDown( key )
end
 
MOAIInputMgr.device.keyboard:setKeyCallback(function(keycode,down) print("keycall",keycode,down) end)

local PropClick = LeftMouseDown:map(function(down, x, y) 
    return propForPoint(x,y) 
  end)
      
     
     
     
local Drags = LeftMouseDown:flatMap(function() return MouseDeltas:takeUntil(LeftMouseUp) end)
                  

function resolveName(prop)
  local name = prop.name or "unnamed"
  if prop.parent then
    return resolveName(prop.parent).."."..name
  else
    return name
  end
end            

PropClick:subscribe(function(prop, layer) 
      print("selected",resolveName(prop),resolveName(layer))
      Editor:select(prop, layer) 
      prop:moveRot(45,3)
      prop:moveScl(0.5,0.5,3)
    end)



