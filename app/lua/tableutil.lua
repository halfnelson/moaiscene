local M = {}

local iter_mt = {
  __call = function(self, t) 
    return self.next, t, nil
  end,
  __index = M
}

local iter_ipairs_mt = {
  __call = function(self, t) 
    return self.next, t, 0
  end,
  __index = M
}

function M.extend(self, iterFunc)
  local object = {
    next = iterFunc,
    type = self.type
  }
  setmetatable(object, self.type)
  return object
end

function M.pairs()
  local object = {
    next = next,
    type = iter_mt
  }
  setmetatable(object, iter_mt)
  return object
end

function M.ipairs()
  local object = {
    next = ipairs({1}),
    type = iter_ipairs_mt
  }
  setmetatable(object, iter_ipairs_mt)
  return object
end



function M.find(t, func)
  for k,v in pairs(t) do
    if func(k,v) then return k,v end
  end
  return nil
end

function M.filter(iter,func)
  return iter:extend(function(t, k)
    local nextkey = k
    local v
    repeat
      nextkey, v = iter.next(t, nextkey) 
      if nextkey ~= nil and func(v, nextkey) then
        return nextkey, v
      end
    until nextkey == nil
  end)
end


function M.map(iter, func)
  return iter:extend(function(t, k)
     local nextkey, v = iter.next(t, k) 
     if nextkey ~= nil then
        return nextkey, func(v, nextkey)
     end
  end)
end


function M.fold(iter, func, t, s)
   for k,v in iter(t) do
     s = func(s, v, k)
   end
   return s
end


function M.toTable(iter,t)
  return M.fold(iter, function(s,v,k) s[k] = v; return s end,  t,  {})
end

function M.toArray(iter, t)
  return M.fold(iter, function(s,v,k) table.insert(s, v); return s end,  t, {})
end

-- table helpers

return M




