--local rx = require('rx')
--local u = require('tableutil')
--editor bootstrap

--local mdbug = require("mobdebug")

io.stdout:setvbuf('no') 
local windowWidth = MOAIEnvironment.horizontalResolution or 300
local windowHeight =MOAIEnvironment.verticalResolution or 300
MOAISim.openWindow ( "test", windowWidth, windowHeight ) --needed but doesn't do anything now

local Editor = require('editor')

-- one main gui viewport
function refreshViewport()
    Editor:resize(MOAIEnvironment.horizontalResolution, MOAIEnvironment.verticalResolution)
end


function processMessage(msg)
    local messagePayload = MOAIJsonParser.decode(msg)
    if (messagePayload and messagePayload.type ~= MOAIJsonParser.JSON_NULL) then
        Editor:handleMessage(messagePayload)
    end
end

refreshViewport()



