// Author: adidvar
// Title: fire frag 

#ifdef GL_ES
precision mediump float;
#endif

//
// GLSL textureless classic 3D noise "cnoise",
// with an RSL-style periodic variant "pnoise".
// Author:  Stefan Gustavson (stefan.gustavson@liu.se)
// Version: 2011-10-11
//
// Many thanks to Ian McEwan of Ashima Arts for the
// ideas for permutation and gradient selection.
//
// Copyright (c) 2011 Stefan Gustavson. All rights reserved.
// Distributed under the MIT license. See LICENSE file.
// https://github.com/stegu/webgl-noise
//

vec3 mod289(vec3 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x)
{
  return mod289(((x*34.0)+10.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec3 fade(vec3 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

// Modulo 7 without a division
vec3 mod7(vec3 x) {
  return x - floor(x * (1.0 / 7.0)) * 7.0;
}

// Permutation polynomial: (34x^2 + 6x) mod 289
vec3 permute(vec3 x) {
  return mod289((34.0 * x + 10.0) * x);
}

// Classic Perlin noise
float cnoise(vec3 P)
{
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  return 2.2 * n_xyz;
}

// Cellular noise, returning F1 and F2 in a vec2.
// Standard 3x3 search window for good F1 and F2 values
vec2 cellular(vec2 P) {
#define K 0.142857142857 // 1/7
#define Ko 0.428571428571 // 3/7
#define jitter 1.0 // Less gives more regular pattern
	vec2 Pi = mod289(floor(P));
 	vec2 Pf = fract(P);
	vec3 oi = vec3(-1.0, 0.0, 1.0);
	vec3 of = vec3(-0.5, 0.5, 1.5);
	vec3 px = permute(Pi.x + oi);
	vec3 p = permute(px.x + Pi.y + oi); // p11, p12, p13
	vec3 ox = fract(p*K) - Ko;
	vec3 oy = mod7(floor(p*K))*K - Ko;
	vec3 dx = Pf.x + 0.5 + jitter*ox;
	vec3 dy = Pf.y - of + jitter*oy;
	vec3 d1 = dx * dx + dy * dy; // d11, d12 and d13, squared
	p = permute(px.y + Pi.y + oi); // p21, p22, p23
	ox = fract(p*K) - Ko;
	oy = mod7(floor(p*K))*K - Ko;
	dx = Pf.x - 0.5 + jitter*ox;
	dy = Pf.y - of + jitter*oy;
	vec3 d2 = dx * dx + dy * dy; // d21, d22 and d23, squared
	p = permute(px.z + Pi.y + oi); // p31, p32, p33
	ox = fract(p*K) - Ko;
	oy = mod7(floor(p*K))*K - Ko;
	dx = Pf.x - 1.5 + jitter*ox;
	dy = Pf.y - of + jitter*oy;
	vec3 d3 = dx * dx + dy * dy; // d31, d32 and d33, squared
	// Sort out the two smallest distances (F1, F2)
	vec3 d1a = min(d1, d2);
	d2 = max(d1, d2); // Swap to keep candidates for F2
	d2 = min(d2, d3); // neither F1 nor F2 are now in d3
	d1 = min(d1a, d2); // F1 is now in d1
	d2 = max(d1a, d2); // Swap to keep candidates for F2
	d1.xy = (d1.x < d1.y) ? d1.xy : d1.yx; // Swap if smaller
	d1.xz = (d1.x < d1.z) ? d1.xz : d1.zx; // F1 is in d1.x
	d1.yz = min(d1.yz, d2.yz); // F2 is now not in d2.yz
	d1.y = min(d1.y, d1.z); // nor in  d1.z
	d1.y = min(d1.y, d2.x); // F2 is in d1.y, we're done.
	return sqrt(d1.xy);
}

float sampletexture(sampler2D image,vec2 uv) {
    vec4 textureColor = texture2D(image, vec2(uv.x,1.0-uv.y));
    return textureColor.r;
}

float blur13(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  float color = 0.0;
  vec2 off1 = vec2(1.411764705882353) * direction;
  vec2 off2 = vec2(3.2941176470588234) * direction;
  vec2 off3 = vec2(5.176470588235294) * direction;
  color += sampletexture(image, uv) * 0.1964825501511404;
  color += sampletexture(image, uv + (off1 / resolution)) * 0.2969069646728344;
  color += sampletexture(image, uv - (off1 / resolution)) * 0.2969069646728344;
  color += sampletexture(image, uv + (off2 / resolution)) * 0.09447039785044732;
  color += sampletexture (image, uv - (off2 / resolution)) * 0.09447039785044732;
  color += sampletexture(image, uv + (off3 / resolution)) * 0.010381362401148057;
  color += sampletexture(image, uv - (off3 / resolution)) * 0.010381362401148057;
  return color;
}

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

uniform sampler2D u_texture;

void main() {
    //textures coords;
    vec2 uv_texture = gl_FragCoord.xy/u_resolution.xy;
    //noise coords
    vec2 uv = uv_texture;
    uv.x *= u_resolution.x/u_resolution.y; 

    //pixelisation
    //float pixalization = 100;
    //uv = floor(uv*pixalization)/pixalization;
    
    vec2 i_move_vector = normalize(vec2(0.0,-1.0));
    float i_move_speed = 2.0;

    vec3 uvt1 = vec3(5 * uv.xy + 3 * i_move_vector * u_time * i_move_speed  , 0.3 * u_time * i_move_speed);
    vec3 uvt2 = vec3(8 * uv.xy + 4 * i_move_vector * u_time * i_move_speed  , 0.4 * u_time * i_move_speed);
    vec3 delta = vec3(1.5,1.9,1.67);

    float noise_value1 = cnoise(uvt1); //[-1;1]
    float noise_value2 = cnoise(uvt1+delta); //[-1;1]
    float noise_value3 = cnoise(uvt2); //[-1;1]

    vec2 noise_circle = vec2(noise_value1,noise_value2)/1.0;
    noise_circle = noise_circle * noise_value3;

    float noise_value4 = cnoise(uvt2 + vec3(noise_circle,0.0)); //[-1;1]

    float flame_noise_value = noise_value4/2.0 + 0.5;

    float uv_value = sampletexture(u_texture,uv_texture);

    vec2 noise_circle1 = vec2(cnoise(uvt1),cnoise(uvt1+delta)) / 12.0;
    vec2 noise_circle2 = vec2(cnoise(uvt2),cnoise(uvt2+delta)) / 16.0;

    float long_check_point = blur13(u_texture,uv_texture+ 0.01 * i_move_vector + noise_circle1,u_resolution,vec2(0,0));
    float short_check_point = blur13(u_texture,uv_texture+ 0.05 * i_move_vector + noise_circle2,u_resolution,vec2(0,0));

    float value = (long_check_point,short_check_point)/2.0;
    
    //float brightness = max(mix(uv_value , flame_noise_value*flame_noise_value * value,noise_value1/2.0 + 0.5),flame_noise_value * value);
    float brightness = blur13(u_texture,uv_texture,u_resolution,vec2(1,0));
    gl_FragColor = vec4(brightness,brightness,brightness,1.000); 

    /*
    if(brightness > 0.9)
        gl_FragColor = vec4(1.000,0.803,0.264,1.000); 
	else if( brightness > 0.6)
        gl_FragColor = vec4(1.000,0.520,0.009,1.0);
    else if( brightness > 0.4)
        gl_FragColor = vec4(0.985,0.402,0.045,1.000);
    else if( brightness > 0.1)
        gl_FragColor = vec4(0.175,0.141,0.046,1.000);
        else
    	gl_FragColor = vec4(0.000,0.0,0.000,1.0);
        */
}



