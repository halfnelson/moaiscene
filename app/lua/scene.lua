local Scene = {}
local Scene_mt = { __index = Scene }

Scene.create = function() 
  local obj = {
    layers = {},
    objects = {}
  }
  setmetatable(obj, Scene_mt)
  return obj
end

function Scene:addLayer(layer)
  table.insert(self.layers, layer)
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

function Scene:detachFromParent(obj)
  if not obj.parent then return end
  obj.parent.children[obj.name] = nil
  obj.parent = nil
end
  


function Scene:setParent(obj, parent)
  self:detachFromParent(obj)
  if not parent then return end
  obj.parent = parent
  if not parent.children then
    parent.children = {}
  end
  parent.children[obj.name] = obj
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

  local current = parent.children and parent.children[thisSegment]

  if not current then return nil end

  if remainder then
     return self:resolveEntity(remainder, current)
  end

  return current

end


return Scene
