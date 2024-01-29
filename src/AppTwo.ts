import {Engine, Scene, Color4, ArcRotateCamera, Vector3, HemisphericLight ,MeshBuilder, StandardMaterial, Color3} from '@babylonjs/core'
import * as BABYLON from '@babylonjs/core'

console.log(BABYLON.Angle)
export default class App {
    engine: Engine;
    scene: Scene;

    constructor(readonly canvas: HTMLCanvasElement) {
        this.engine = new Engine(canvas)
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
        this.scene = createScene(this.engine, this.canvas)
        // this.debug(true)
    }

    debug(debugOn: boolean = true) {
        if (debugOn) {
            this.scene.debugLayer.show({ overlay: true });
        } else {
            this.scene.debugLayer.hide();
        }
    }

    run() {
        // this.debug(true);
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }



}

var createScene = function (engine: Engine, canvas: HTMLCanvasElement) {
    // #region 初始化场景
    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI * 0.7, Math.PI * 0.4, 10, new BABYLON.Vector3(0, 0, 0), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const wireframeMaterial = new BABYLON.StandardMaterial("Wireframe Material", scene);
    wireframeMaterial.wireframe = true;
    
    const myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
    myMaterial.diffuseTexture = new BABYLON.Texture("t.png", scene);
    // #endregion


    // #region Step 1: 我们在 shadertoy 中写的只是 fragment shader，意思是在一个矩形的表面画画
    // 这个矩形由两个三角形拼接而成，就像这里演示的一样
    // var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 3, height: 3, subdivisions: 30}, scene);
    // ground.material = wireframeMaterial;
    // #endregion

    
    // #region Step 2: 除了自行在 fragment shader 中用各种数学计算实现 3d 以外，更常用的方式是通过 vertex shader 操作顶点
    // 但前面只有寥寥几个点，不太好说明，我们可以构建一个由更多点组成的平面，然后使用 vertex shader 任意操作每个点的坐标
    // var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 3, height: 3, subdivisions: 10}, scene);
    // ground.material = myMaterial;
    // #endregion


    // #region Step 3: 我们用 shader material 替换 wireframe material
    // vertex shader 用于操作顶点 y 坐标起伏。fragment shader 暂时固定返回白色
    // var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 7, height: 7, subdivisions: 20}, scene);
    // BABYLON.Effect.ShadersStore["customVertexShader"] = ` 
    //     precision highp float;
        
    //     // Attributes
    //     attribute vec3 position;
    //     attribute vec3 normal;
    //     attribute vec2 uv;
        
    //     // Uniforms
    //     uniform mat4 worldViewProjection;
    //     uniform float time;

    //     // Varying
    //     varying float y;

    //     void main(void) {
    //         vec3 p = position;
    //         y = (sin(time + position.x) + cos(time + position.z)) / 2.;
    //         p.y = y;
    //         gl_Position = worldViewProjection * vec4(p, 1.0);
    //     }
    // `
    // BABYLON.Effect.ShadersStore["customFragmentShader"] = `
    //     precision highp float;

    //     varying float y;
        
    //     void main(void) {
    //         // rgba(255,255,255,255)
    //         // css 中颜色范围是 [0,255]，glsl 中是个浮点数 [0,1.0]
    //         gl_FragColor = vec4(1.,1.,1.,1.);
    //     }
    // `

    // const shaderMaterial = new BABYLON.ShaderMaterial(
    //     "shader",
    //     scene,
    //     {
    //         vertex: 'custom',
    //         fragment: 'custom',
    //     },
    //     {
    //         attributes: ["position", "normal", "uv"],
	// 		uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
    //     },
    // );

    // shaderMaterial.backFaceCulling = false;
    // shaderMaterial.wireframe = true;
    // ground.material = shaderMaterial;

    // let time = 0.;
    // scene.registerBeforeRender(function() {
    //     ;(ground.material as BABYLON.ShaderMaterial)!.setFloat('time', time)
    //     time += 0.1;
    // });
    // #endregion


    // #region Step 4: 增加平面的细分数量，简单实现一个 fragment shader，根据 y 坐标不同渲染不同颜色。
    var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 7, height: 7, subdivisions: 20}, scene);
    BABYLON.Effect.ShadersStore["customVertexShader"] = ` 
        precision highp float;
        
        // Attributes
        attribute vec3 position;
        attribute vec3 normal;
        attribute vec2 uv;
        
        // Uniforms
        uniform mat4 worldViewProjection;
        uniform float time;

        // Varying
        varying float y;

        void main(void) {
            vec3 p = position;
            y = (sin(time + position.x) + cos(time + position.z)) / 2.;
            p.y = y;
            gl_Position = worldViewProjection * vec4(p, 1.0);
        }
    `
    BABYLON.Effect.ShadersStore["customFragmentShader"] = `
        precision highp float;

        varying float y;
        
        void main(void) {
            // 参数 y 的值是 vertex shader 中传进来的。
            // sin/cos 的取值范围是 [-1, 1]，需要按我们的需求，映射到颜色值取值范围（[0, 1.0]）内。
            float r = y / 2. + 0.5;  // [-1, 1] -> [0,   1]
            float g = y / 4. + 0.75; // [-1, 1] -> [0.5, 1]
            
            // vec4(r, g, b, a) 相当于 css 的 rgba()，取值范围从 [0,255] 变成一个浮点数 [0, 1.0]
            // 把颜色值赋值给 gl_FragColor 就相当于是 fragment shader 的返回值
            gl_FragColor = vec4(r, g, 1., 1.);
        }
    `

    const shaderMaterial = new BABYLON.ShaderMaterial(
        "shader",
        scene,
        {
            vertex: 'custom',
            fragment: 'custom',
        },
        {
            attributes: ["position", "normal", "uv"],
			uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
        },
    );

    shaderMaterial.backFaceCulling = false;
    ground.material = shaderMaterial;

    let time = 0.;
    scene.registerBeforeRender(function() {
        ;(ground.material as BABYLON.ShaderMaterial)!.setFloat('time', time)
        time += 0.1;
    });
    // #endregion

    return scene;
};