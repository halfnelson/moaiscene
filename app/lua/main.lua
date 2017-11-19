--local rx = require('rx')
--local u = require('tableutil')
--editor bootstrap

--local mdbug = require("mobdebug")

io.stdout:setvbuf('no') 
local windowWidth = 640 --MOAIEnvironment.horizontalResolution or 300
local windowHeight = 480 -- MOAIEnvironment.verticalResolution or 300
MOAISim.openWindow ( "test", windowWidth, windowHeight ) --needed but doesn't do anything now


local Editor = require('editor')
local Scene = require('scene')
local scene = Scene.create()
  



-- one main gui viewport
function refreshViewport()
   --print("resizing",MOAIEnvironment.verticalResolution, MOAIEnvironment.horizontalResolution )
  local w,h = MOAIGfxMgr.getViewSize();
  print("resizing",MOAIEnvironment.verticalResolution, MOAIEnvironment.horizontalResolution," current:", w,h )
  -- Editor:resize(MOAIEnvironment.horizontalResolution, MOAIEnvironment.verticalResolution)
  Editor:resize(640, 480)
end

refreshViewport()

MOAIRenderMgr.setRender({
    scene.layers,
    Editor.layer
})



local gfxQuad = MOAISpriteDeck2D.new ()
gfxQuad:setTexture ( "moai.png" )
gfxQuad:setRect ( -64, -64, 64, 64 )
gfxQuad.name = "TestQuad"

scene:addDeck(gfxQuad)


--local sceneViewport = MOAIViewport.new()
--sceneViewport:setSize (windowWidth,  windowHeight )
--sceneViewport:setScale ( windowWidth ,  windowHeight)
--scene:addViewport(sceneViewport)

local layer = MOAIPartitionViewLayer.new ()
layer.name = "Main"
layer:setViewport ( Editor.viewport )
layer:setCamera( Editor.camera )

scene:addLayer(layer)

local prop = MOAIGraphicsProp.new ()
prop:setDeck ( gfxQuad )
prop.name = "prop1"
prop.parent = layer
prop:setPartition( layer )

scene:addProp(prop)

rx = require('rx')

--rx setup
local Scheduler = rx.CooperativeScheduler.create(0)
local schedulerThread = MOAICoroutine.new()
local lastStep = MOAISim:getElapsedTime()

schedulerThread:run(function() 
  local now = MOAISim:getElapsedTime()
  local delta = now - lastStep
  Scheduler:update(delta)
end)


LeftMouse = rx.Subject.create()
function onMouseLeftEvent ( down )
    local x, y = MOAIInputMgr.device.pointer:getLoc()
    LeftMouse:onNext( down, x, y  )
end
MOAIInputMgr.device.mouseLeft:setCallback ( onMouseLeftEvent )


RightMouse = rx.Subject.create()
function onMouseRightEvent ( down )
    local x, y = MOAIInputMgr.device.pointer:getLoc()
    RightMouse:onNext( down, x, y  )
end
MOAIInputMgr.device.mouseRight:setCallback ( onMouseRightEvent )

RightMouse:subscribe(function(down,x,y)
    print("right mouse",down,x,y)
end)

MousePos = rx.Subject.create()
function onMouseMoveEvent( x, y )
    MousePos:onNext( x, y )
end



MOAIInputMgr.device.pointer:setCallback( onMouseMoveEvent )

LeftMouseDown = LeftMouse:filter(function(down) return down end)
LeftMouseUp = LeftMouse:filter(function(down) return not down end)

RightMouseDown = RightMouse:filter(function(down) return down end)
RightMouseUp = RightMouse:filter(function(up) return not down end)

MouseDeltas = MousePos:pack():skip(1):zip(MousePos:pack()):map(function(newpos, oldpos) return newpos[1] - oldpos[1], newpos[2] - oldpos[2] end)

local RightMouseDrag = RightMouseDown:flatMap(function() return MouseDeltas:takeUntil(RightMouseUp) end)

RightMouseDrag:subscribe(function(dx,dy) 
    Editor:panView(dx,dy)
end)




local function checkKey ( key )
  return MOAIInputMgr.device.keyboard:keyIsDown( key )
end
 
MOAIInputMgr.device.keyboard:setKeyCallback(function(keycode,down) print("keycall",keycode,down) end)

local PropClick = LeftMouseDown:map(function(down, x, y) 
    return scene:propForPoint(x,y)
  end):compact()
     
local Drags = LeftMouseDown:flatMap(function() return MouseDeltas:takeUntil(LeftMouseUp) end)
         

PropClick:subscribe(function(prop, layer) 
    print("gotpropclick", prop, layer)
    print("prop",scene:resolveName(prop))
    print("layer",scene:resolveName(layer))
    print("selected",scene:resolveName(prop),scene:resolveName(layer))
    Editor:select(prop, layer) 
    prop:moveRot(0,0,45,3)
    prop:moveScl(0.5,0.5,0.0, 3)
    end,
    function(err) 
        print("error in propclick",err)
    end
)

print("hello from editor")

