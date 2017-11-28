local NullVertexShader = [[
    attribute vec4 position;
    void main () {
      gl_Position = position;
    }
]]

local GridShader = [[

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
]]
--from https://www.shadertoy.com/view/MtlcWX