--rx setup
local rx = require('rx')

local events = {}

-- Scheduler setup
local Scheduler = rx.CooperativeScheduler.create(0)
local schedulerThread = MOAICoroutine.new()
local lastStep = MOAISim:getElapsedTime()

schedulerThread:run(function() 
  local now = MOAISim:getElapsedTime()
  local delta = now - lastStep
  Scheduler:update(delta)
end)

-- Mouse Clicks

local LeftMouse = rx.Subject.create()
local function onMouseLeftEvent ( down )
    local x, y = MOAIInputMgr.device.pointer:getLoc()
    LeftMouse:onNext( down, x, y  )
end
MOAIInputMgr.device.mouseLeft:setCallback ( onMouseLeftEvent )
local LeftMouseDown = LeftMouse:filter(function(down) return down end)
local LeftMouseUp = LeftMouse:filter(function(down) return not down end)


local RightMouse = rx.Subject.create()
local function onMouseRightEvent ( down )
    local x, y = MOAIInputMgr.device.pointer:getLoc()
    RightMouse:onNext( down, x, y  )
end
MOAIInputMgr.device.mouseRight:setCallback ( onMouseRightEvent )
local RightMouseDown = RightMouse:filter(function(down) return down end)
local RightMouseUp = RightMouse:filter(function(up) return not down end)

-- Mouse moves

local MousePos = rx.Subject.create()
local function onMouseMoveEvent( x, y )
    MousePos:onNext( x, y )
end
MOAIInputMgr.device.pointer:setCallback( onMouseMoveEvent )
local MouseDeltas = MousePos:pack():skip(1):zip(MousePos:pack()):map(function(newpos, oldpos) return newpos[1] - oldpos[1], newpos[2] - oldpos[2] end)
local RightMouseDrag = RightMouseDown:flatMap(function() return MouseDeltas:takeUntil(RightMouseUp) end)
local LeftMouseDrag = LeftMouseDown:flatMap(function() return MouseDeltas:takeUntil(LeftMouseUp) end)

-- Keyboard

local function keyIsDown ( key )
    return MOAIInputMgr.device.keyboard:keyIsDown( key )
end

local keyEvent = rx.Subject.create()
local function onKeyEvent(keycode, down)
    keyEvent:onNext( keycode, down )
end
MOAIInputMgr.device.keyboard:setKeyCallback( onKeyEvent )


events.leftMouse = LeftMouse
events.leftMouseDown = LeftMouseDown
events.leftMouseUp = LeftMouseUp

events.rightMouse = RightMouse
events.rightMouseDown = RightMouseDown
events.rightMouseUp = RightMouseUp

events.mousePos = MousePos
events.rightMouseDrag = RightMouseDrag
events.leftMouseDrag = LeftMouseDrag

events.keyEvent = keyEvent
events.keyIsDown = keyIsDown


return events