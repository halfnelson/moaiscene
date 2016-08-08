--editor bootstrap

MOAISim.openWindow ( "test", 300, 300 ) --needed


local viewport = MOAIViewport.new ()

function refreshViewport()
  
    viewport:setSize ( MOAIEnvironment.horizontalResolution,  MOAIEnvironment.verticalResolution )
    viewport:setScale ( MOAIEnvironment.horizontalResolution, MOAIEnvironment.verticalResolution )
  -- viewport:setOffset(-1,1)
end

refreshViewport()


gfxQuad = MOAIGfxQuad2D.new ()
gfxQuad:setTexture ( "moai.png" )
gfxQuad:setRect ( -64, -64, 64, 64 )

local layer = MOAILayer2D.new ()
MOAISim.pushRenderPass ( layer )
layer:setViewport ( viewport )

local camera = MOAICamera2D.new ()
camera:setScl(1,1)
layer:setCamera(camera)


local prop = MOAIProp2D.new ()

prop:setDeck ( gfxQuad )
layer:insertProp ( prop )




local newloc = 64

function onMouseLeftEvent ( down )
    if down then
        camera:seekLoc(newloc,0,3)
        if newloc == 64 then
            newloc = 0
        else
            newloc = 64
        end
        print(prop:getBounds())

    end
end

MOAIInputMgr.device.mouseLeft:setCallback ( onMouseLeftEvent )




