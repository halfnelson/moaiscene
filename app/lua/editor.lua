local u = require('tableutil')
local Scene = require('scene')
local Events = require('inputEvents')

Editor = {
  viewport = MOAIViewport.new (),
  camera = MOAICamera.new (),
  layer = MOAIPartitionViewLayer.new(),
  selection = {},
  scene = nil
}


Editor.layer:setViewport(Editor.viewport)
Editor.layer:setCamera(Editor.camera)


function Editor:setScene(scene)
    self.scene = scene
    self.camera:setLoc(0,0,0)
    self.layer:setScl(1,1,1)
    MOAIRenderMgr.setRender({
      self.scene.layers,
      self.layer
    })
end


function Editor:loadNewScene()
  self:setScene(Scene.create())
end

function Editor:clearSelection()
  Editor.selection = {}
end

function Editor:deselect(prop)
  Editor.selection = u.ipairs():filter(function(v) return v ~= prop end):toArray(Editor.selection)
end

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

function Editor:resize(width, height) 
    self.viewport:setSize ( width,  height )
    self.viewport:setScale ( width,  height )
end

function Editor:panView(dx,dy)
  self.camera:moveLoc(-dx, dy, 0)
end


function Editor:select(prop, layer) 
  
  local pin = MOAIPinTransform.new()
  pin:init( layer, self.layer)
  pin:setNodeLink( prop )
  
  
  local selectionProp = MOAIGraphicsProp.new()
  selectionProp:setAttrLink(MOAITransform.INHERIT_LOC, pin, MOAITransform.TRANSFORM_TRAIT)
  selectionProp:setAttrLink(MOAITransform.ATTR_Z_ROT, prop, MOAITransform.ATTR_Z_ROT)
  
  
  local scriptdeck = MOAIDrawDeck.new()
  scriptdeck:setBounds()
  --scriptdeck:setRect(0,0,1,1) --not sure why this is needed for scriptdeck? does it help with font or something?
  
  scriptdeck:setDrawCallback(function() 
        -- Find our props rect on our gui layer
        local x0,y0,z0,x1,y1,z1,x2,y2,z2,x3,y3,z3 = self:getEditorCorners(prop, layer)
        x0,y0,z0 = selectionProp:worldToModel(x0, y0, z0)
        x1,y1,z1 = selectionProp:worldToModel(x1, y1, z1)
        x2,y2,z2 = selectionProp:worldToModel(x2, y2, z2)
        x3,y3,z3 = selectionProp:worldToModel(x3, y3, z3)
        -- box it
        MOAIDraw.setPenColor(0.8, 0, 0.8, 0.8)
        local width = 2
        MOAIDraw.fillRect(x0-width, y0, x1+width, y1-width)
        MOAIDraw.fillRect(x1, y1-width, x2+width, y2+width)
        MOAIDraw.fillRect(x2+width, y2, x3-width, y3+width)
        MOAIDraw.fillRect(x3, y3+width, x0-width, y0-width)
      end)
  
  selectionProp:setDeck(scriptdeck)
  selectionProp:setPartition(self.layer)
 
  table.insert(self.selection, prop)
end

function Editor:sendMessage(msg) 
  local messageString = MOAIJsonParser.encode(msg)
  if (messageString) then
    print("MESSAGE: "..messageString)
  end
end

-- Input Actions

Events.rightMouseDrag:subscribe(function(dx,dy) 
  Editor:panView(dx,dy)
end)

local propClick = Events.leftMouseDown:map(function(down, x, y) 
  return Editor.scene:propForPoint(x,y)
end):compact()
 

propClick:subscribe(
  function(prop, layer) 
      print("gotpropclick", prop, layer)
      Editor:sendMessage({
          type = "propClick",
          propName = Editor.scene:resolveName(prop),
          ctrlDown = Events.keyIsDown(MOAIKeyCode.CONTROL)
      })
   end,
  function(err) 
      print("error in propclick",err)
  end
)

-- Message Processing
function Editor:createObjectByClassName(objClass, args)
  local class = _G[objClass]
  if not class then 
      print("Could not find class ",objClass)
      return nil
  end

  if not class.new then
      print("Could not find constructor for ",objClass)
      return nil
  end
  return class.new()
end


function Editor:createObject(objClass, name, parentName, args)
  
  local parent
  if not parentName then 
    parent = self.scene.objects
  else
    parent = self.scene:resolveEntity(parentName)
  end

  local obj = self:createObjectByClassName(objClass, args)
  
  if not obj then return end
  
  obj.name = name
  
  self.scene:setParent(obj, parent)
  
  print("Object created", obj)

  if (obj.setViewport) then
      obj:setViewport( self.viewport )
      obj:setCamera( self.camera )   
      self.scene:addLayer(obj)
  end

end

local function nullToNil(val)
  if (val == MOAIJsonParser.JSON_NULL) then
      return nil
  end
  return val
end

function Editor:setObjectProperty(target, propertyName, value)
  local targetEntity = self.scene:resolveEntity(target)

  if not targetEntity then
      print("Could not find target entity for setProperty",target )
      return
  end

  if targetEntity['set'..propertyName] then
      if (type(value) == "table") then
          targetEntity['set'..propertyName](targetEntity, unpack(value))
      else
          targetEntity['set'..propertyName](targetEntity, value)
      end
      return
  end
 
  targetEntity[propertyName] = value
end



function Editor:handleMessage(msg)
  if (msg.type == "createObject") then 
      self:createObject(msg.objectClass, msg.name, nullToNil(msg.parent), msg.args)
  end 

  if (msg.type == "setScalarProperty") then
      self:setObjectProperty(msg.target, msg.propertyName, nullToNil(msg.value)) 
  end

  if (msg.type == "setRefProperty") then
      local ref = nullToNil(msg.value)       
      self:setObjectProperty(msg.target, msg.propertyName, ref and self.scene:resolveEntity(ref) or nil ) 
  end
end


Editor:loadNewScene()

return Editor