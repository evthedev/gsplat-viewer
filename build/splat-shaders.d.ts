export declare const vertexShaderSource = "\nprecision mediump float;\n\nattribute vec3 position;\n\nattribute vec4 color;\nattribute vec4 quat;\nattribute vec3 scale;\nattribute vec3 center;\n\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform vec2 focal;\nuniform vec2 viewport;\n\nvarying vec4 vColor;\nvarying vec3 vConic;\nvarying vec2 vCenter;\nvarying vec2 vPosition;\n\nmat3 transpose(mat3 m) { return mat3(m[0][0], m[1][0], m[2][0], m[0][1], m[1][1], m[2][1], m[0][2], m[1][2], m[2][2]); }\n\nmat3 compute_cov3d(vec3 scale, vec4 rot) {\n    mat3 S = mat3(\n        scale.x, 0.0, 0.0,\n        0.0, scale.y, 0.0,\n        0.0, 0.0, scale.z\n    );\n    mat3 R = mat3(\n        1.0 - 2.0 * (rot.z * rot.z + rot.w * rot.w), 2.0 * (rot.y * rot.z - rot.x * rot.w), 2.0 * (rot.y * rot.w + rot.x * rot.z),\n        2.0 * (rot.y * rot.z + rot.x * rot.w), 1.0 - 2.0 * (rot.y * rot.y + rot.w * rot.w), 2.0 * (rot.z * rot.w - rot.x * rot.y),\n        2.0 * (rot.y * rot.w - rot.x * rot.z), 2.0 * (rot.z * rot.w + rot.x * rot.y), 1.0 - 2.0 * (rot.y * rot.y + rot.z * rot.z)\n    );\n    mat3 M = S * R;\n    return transpose(M) * M;\n}\n\nvec3 compute_cov2d(vec3 center, vec3 scale, vec4 rot){\n    mat3 Vrk = compute_cov3d(scale, rot);\n    vec4 t = modelViewMatrix * vec4(center, 1.0);\n    vec2 lims = 1.3 * 0.5 * viewport / focal;\n    t.xy = min(lims, max(-lims, t.xy / t.z)) * t.z;\n    mat3 J = mat3(\n        focal.x / t.z, 0., -(focal.x * t.x) / (t.z * t.z), \n        0., focal.y / t.z, -(focal.y * t.y) / (t.z * t.z), \n        0., 0., 0.\n    );\n    mat3 W = transpose(mat3(modelViewMatrix));\n    mat3 T = W * J;\n    mat3 cov = transpose(T) * transpose(Vrk) * T;\n    return vec3(cov[0][0] + 0.3, cov[0][1], cov[1][1] + 0.3);\n}\n\nvoid main () {\n    vec4 camspace = modelViewMatrix * vec4(center, 1);\n    \n    vec4 pos2d = projectionMatrix  * camspace;\n\n    vec3 cov2d = compute_cov2d(center, scale, quat);\n    float det = cov2d.x * cov2d.z - cov2d.y * cov2d.y;\n    vec3 conic = vec3(cov2d.z, cov2d.y, cov2d.x) / det;\n    float mid = 0.5 * (cov2d.x + cov2d.z);\n    float lambda1 = mid + sqrt(max(0.1, mid * mid - det));\n    float lambda2 = mid - sqrt(max(0.1, mid * mid - det));\n    vec2 v1 = 7.0 * sqrt(lambda1) * normalize(vec2(cov2d.y, lambda1 - cov2d.x));\n    vec2 v2 = 7.0 * sqrt(lambda2) * normalize(vec2(-(lambda1 - cov2d.x),cov2d.y));\n\n    vColor = color;\n    vConic = conic;\n    vCenter = vec2(pos2d) / pos2d.w;\n\n    vPosition = vec2(vCenter + position.x * (position.y < 0.0 ? v1 : v2) / viewport);\n    gl_Position = vec4(vPosition, pos2d.z / pos2d.w, 1);\n}\n";
export declare const fragmentShaderSource = "\nprecision mediump float;\n\nvarying vec4 vColor;\nvarying vec3 vConic;\nvarying vec2 vCenter;\n\nuniform vec2 viewport;\nuniform vec2 focal;\n\nvoid main () {    \n\tvec2 d = (vCenter - 2.0 * (gl_FragCoord.xy/viewport - vec2(0.5, 0.5))) * viewport * 0.5;\n    \n\tfloat power = -0.5 * (vConic.x * d.x * d.x + vConic.z * d.y * d.y) + vConic.y * d.x * d.y;\n\n\tif (power > 0.0) discard;\n\tfloat alpha = min(0.99, vColor.a * exp(power));\n\tif(alpha < 0.02) discard;\n\n    gl_FragColor = vec4(vColor.rgb, alpha);\n}\n";
