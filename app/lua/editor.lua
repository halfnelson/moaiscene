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

function Editor:panView(dx,dy)
  self.camera:moveLoc(-dx, dy, 0)
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

local GridShader = """

void stroke(float dist, vec3 color, inout vec3 fragColor, float thickness, float aa)
{
    float alpha = smoothstep(0.5 * (thickness + aa), 0.5 * (thickness - aa), abs(dist));
    fragColor = mix(fragColor, color, alpha);
}

void renderGrid(vec2 pos, out vec3 fragColor)
{
    vec3 background = vec3(1.0);
    vec3 axes = vec3(0.4);
    vec3 lines = vec3(0.7);
    vec3 sublines = vec3(0.95);
    float subdiv = 8.0;

    float thickness = 0.003;
    float aa = length(fwidth(pos));

    fragColor = background;

    vec2 toSubGrid = pos - round(pos*subdiv)/subdiv;
    stroke(min(abs(toSubGrid.x), abs(toSubGrid.y)), sublines, fragColor, thickness, aa);

    vec2 toGrid = pos - round(pos);
    stroke(min(abs(toGrid.x), abs(toGrid.y)), lines, fragColor, thickness, aa);
    stroke(min(abs(pos.x), abs(pos.y)), axes, fragColor, thickness, aa);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    float aspect = iResolution.x / iResolution.y;
  	vec2 pos = (fragCoord / iResolution.y) * 1.3 - vec2((1.3*aspect - 1.0)/2.0, 0.15);
    fragColor.a = 1.0;
  	renderGrid(pos, fragColor.rgb);
}
"""



return Editor