MOAISim.openWindow ( "test", 320, 480 )





gviewport = MOAIViewport.new ()
gviewport:setSize ( 320, 480 )
gviewport:setScale ( 1, 1 )

glayer = MOAIPartitionViewLayer.new ()
glayer:setViewport ( gviewport )
glayer:pushRenderPass ()

function onDraw ( index, xOff, yOff, xFlip, yFlip )
	 MOAIDraw.drawLine(0,-0.5,0,0.5)
end

scriptDeck = MOAIDrawDeck.new ()
scriptDeck:setBounds ( -0.5, -0.5, 0.5, 0.5 )
scriptDeck:setDrawCallback ( onDraw )

deck = MOAISpriteDeck2D.new()
deck:setRect(-0.5, -0.5, 0.5, 0.5)


gprop = MOAIProp.new ()
gprop:setDeck ( deck )
gprop:setPartition ( glayer )








viewport = MOAIViewport.new ()
viewport:setSize ( 320, 480 )
viewport:setScale ( 320, 480 )

layer = MOAIPartitionViewLayer.new ()
layer:setViewport ( viewport )
layer:pushRenderPass ()



prop = MOAIProp.new ()
prop:setDeck ( 'moai.png' )
prop:setPartition ( layer )
prop:moveRot ( 0, 0, 360, 5 )












vsh = [[
  attribute vec4 position;
  attribute vec2 uv;
  attribute vec4 color;
  
  varying vec4 colorVarying;
  varying vec2 uvVarying;
  
    void main () {
      gl_Position = position;
      uvVarying = uv;
      colorVarying = color;
    }
]]



fsh = [[

uniform sampler2D sampler;
uniform float xResolution;
uniform float yResolution;

varying vec4 colorVarying;
varying vec2 uvVarying;

void stroke(float dist, vec3 color, inout vec3 fragColor, float thickness, float aa)
{
    float alpha = smoothstep(0.5 * (thickness + aa), 0.5 * (thickness - aa), abs(dist));
    fragColor = mix(fragColor, color, alpha);
}

void renderGrid(vec2 pos, out vec3 fragColor)
{

    vec3 background = vec3(0.0);
    vec3 axes = vec3(0.95);
    vec3 lines = vec3(0.7);
    vec3 sublines = vec3(0.35);
    float subdiv = 8.0;

    float thickness = 0.003;
    float aa = 0.006;

    fragColor = background;

    vec2 toSubGrid = pos - floor(pos*subdiv + 0.5)/subdiv;
    stroke(min(abs(toSubGrid.x), abs(toSubGrid.y)), sublines, fragColor, thickness, aa);

    vec2 toGrid = pos - floor(pos+0.5);
    stroke(min(abs(toGrid.x), abs(toGrid.y)), lines, fragColor, thickness, aa);
    stroke(min(abs(pos.x), abs(pos.y)), axes, fragColor, thickness, aa);
}

void main () { 
  float aspect = xResolution / yResolution;
  vec2 coord = gl_FragCoord.xy;
  vec2 pos = (coord / yResolution) * 1.3 - vec2((1.3*aspect - 1.0)/2.0, 0.15);
  gl_FragColor.a = 1.0;
  renderGrid(pos, gl_FragColor.rgb);
}
]]

program = MOAIShaderProgram.new ()

program:setVertexAttribute ( 1, 'position' )
program:setVertexAttribute ( 2, 'uv' )
program:setVertexAttribute ( 3, 'color' )

program:reserveUniforms ( 2 )
program:declareUniform ( 1, 'xResolution', MOAIShaderProgram.UNIFORM_TYPE_FLOAT )
program:declareUniform ( 2, 'yResolution', MOAIShaderProgram.UNIFORM_TYPE_FLOAT )


program:load ( vsh, fsh )

shader = MOAIShader.new ()
shader:setProgram ( program )
shader:setAttr ( 1, 320 )
shader:setAttr ( 2, 480 )
gprop:setShader ( shader )