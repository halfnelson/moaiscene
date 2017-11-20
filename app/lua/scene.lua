local Scene = {}
local Scene_mt = { __index = Scene }

Scene.create = function() 
  local obj = {
    viewports = {},
    layers = {},
    props = {},
    decks = {},
    resources = {},
    objects = {}
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

function Scene:addRootObject(name, obj)
  self.objects[name] = obj
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
  if entity.parent and entity.parent ~= self.objects then
    return self:resolveName(entity.parent).."."..name
  else
    return name
  end
end

function Scene:resolveEntity(name, parent)
  
 -- if not parent and (string.find(name, "_scene", 1, true) == 1) then
 --    parent = self.objects
 --    name = string.sub(name, #"_scene"+1)
 -- end

  parent = parent or self.objects;
 
  local thisSegment = name
  local remainder = false
  local dotidx = string.find(name, '.', 1, true)
  if dotidx ~= nil then 
    remainder = string.sub(name, dotidx+1)
    thisSegment = string.sub(name, 1, dotidx) 
  end

  if parent[thisSegment] == nil then return nil end

  if remainder then
     return self:resolveEntity(remainder, parent[thisSegment])
  end

  return parent[thisSegment]

end


return Scene
