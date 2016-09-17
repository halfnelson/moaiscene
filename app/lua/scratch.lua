local u = require('tableutil').ipairs()

local adder = u:map(function(v) return v+1 end)
local largerthan3 = adder:filter(function(v) return v > 3 end)

for k,v in adder({1,2,3}) do
  print(k,v)
end

for k,v in largerthan3({2,3,4}) do
  print(k,v)
end