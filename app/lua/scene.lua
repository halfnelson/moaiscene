local Scene = {}
local Scene_mt = { __index = Scene }

Scene.create = function() 
  local obj = {
    viewports = {},
    layers = {},
    props = {},
    decks = {},
    resources = {}
  }
  setmetatable(obj, Scene_mt)
  return obj
end

function Scene:addViewport(viewport)
  table.insert(self.viewports, viewport)
end

function Scene:addLayer(layer)
  table.insert(self.layers, layer)
end

function Scene:addProp(prop)
   table.insert(self.props, prop)
end

function Scene:addDeck(deck)
   table.insert(self.decks, deck)
end

function Scene:addResourse(resource)
   table.insert(self.resources, resource)
end


function Scene:propForPoint(x,y)
  --search all layers
  for _,layer in ipairs(self.layers) do
    local mx,my = layer:wndToWorld(x,y)
    local p = layer:getLayerPartition():hullForPoint(mx,my)
    if p then return p, layer end
  end
  return false
end

function Scene:resolveName(entity)
  local name = entity.name or "unnamed"
  if entity.parent then
    return self:resolveName(entity.parent).."."..name
  else
    return name
  end
end




return Scene
