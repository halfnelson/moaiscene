local u = require('tableutil')

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

return Editor