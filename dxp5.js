dxp5FiltMap = {}

/*  Load the filter shader from a file.
    Must be used during preload.                */
dxp5LoadFilterSrc = function (filtFilename) {
    let loadedShaderSrc = '';

    this.loadStrings(
        filtFilename,
        result => {
            loadedShaderSrc = result.join('\n');
            loadedFilt = true;
            dxp5FiltMap[filtFilename] = loadedShaderSrc
        }
    );
};


/*  Create a p5.Shader from a previously loaded 
    filter shader.
    Must be used after preload.                 */
dxp5CreateFilter = function (filtFilename) {
    shaderSrc = dxp5FiltMap[filtFilename];
    return createFilterShader(shaderSrc);
}


/*  Create a filter shader entirely during preload.
    Warning: Depends on hardcoded vertex shaders. 
    If these are changed in a future update of 
    p5.js, this will need to be updated too.    */
dxp5LoadFilter = function (
    fragFilename
) {
    let defaultVertV1 = `
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;

        attribute vec3 aPosition;
        // texcoords only come from p5 to vertex shader
        // so pass texcoords on to the fragment shader in a varying variable
        attribute vec2 aTexCoord;
        varying vec2 vTexCoord;

        void main() {
        // transferring texcoords for the frag shader
        vTexCoord = aTexCoord;

        // copy position with a fourth coordinate for projection (1.0 is normal)
        vec4 positionVec4 = vec4(aPosition, 1.0);

        // project to 3D space
        gl_Position = uProjectionMatrix * uModelViewMatrix * positionVec4;
        }
    `;
    let defaultVertV2 = `#version 300 es
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;

        in vec3 aPosition;
        in vec2 aTexCoord;
        out vec2 vTexCoord;

        void main() {
        // transferring texcoords for the frag shader
        vTexCoord = aTexCoord;

        // copy position with a fourth coordinate for projection (1.0 is normal)
        vec4 positionVec4 = vec4(aPosition, 1.0);

        // project to 3D space
        gl_Position = uProjectionMatrix * uModelViewMatrix * positionVec4;
        }
    `;
    const loadedShader = new p5.Shader();

    const self = this;
    let loadedFrag = false;

    this.loadStrings(
        fragFilename,
        result => {
            let fragSrc = result.join('\n');
            let vertSrc = fragSrc.includes('#version 300 es') ? defaultVertV2 : defaultVertV1;
            loadedShader._vertSrc = vertSrc;
            loadedShader._fragSrc = fragSrc;
            loadedFrag = true;
        }
    );

    return loadedShader;
};
