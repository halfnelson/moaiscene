local components = {}

table.insert(components, {
  name = "MOAIPartitionViewLayer",
  properties = {}
})

table.insert(components, {
  name = "MOAIGraphicsProp",
  properties = {
    { name = "Deck", type = "ref" }
    { name = "Partition", type = "ref" }
  }
})

table.insert(components, {
  name = "MOAISpriteDeck2D",
  properties = {
    { name = "Texture", type = "scalar" }
    { name = "Rect", type = "scalar" }
  }
})


return components