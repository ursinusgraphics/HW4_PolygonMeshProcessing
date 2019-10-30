/**
 * 
 * @param {DOM Element} glcanvas Handle to HTML where the glcanvas resides
 * @param {string} shadersrelpath Path to the folder that contains the shaders,
 *                                relative to where the constructor is being called
 */
function HalfEdgeCanvas(glcanvas, shadersrelpath) {
    BaseCanvas(glcanvas, shadersrelpath);
    glcanvas.mesh = new HedgeMesh();
    glcanvas.camera = new MousePolarCamera(glcanvas.width, glcanvas.height);
    glcanvas.drawer = new SimpleDrawer(glcanvas.gl, glcanvas.shaders);

    /////////////////////////////////////////////////////
    //Step 1: Setup repaint function
    /////////////////////////////////////////////////////    
    glcanvas.repaint = function() {
        glcanvas.gl.viewport(0, 0, glcanvas.gl.viewportWidth, glcanvas.gl.viewportHeight);
        glcanvas.gl.clear(glcanvas.gl.COLOR_BUFFER_BIT | glcanvas.gl.DEPTH_BUFFER_BIT);

        //NOTE: glcanvas has all options we need except
        //for "shaderToUse"
        glcanvas.shaderToUse = glcanvas.shaders.blinnPhong;
        glcanvas.light1 = {pos:glcanvas.camera.pos, color:[1, 1, 1]};
        glcanvas.mesh.render(glcanvas);

        let drawer = glcanvas.drawer;
        drawer.reset();
        if (glcanvas.vertTest.showResult) {
            let v = glcanvas.mesh.vertices[glcanvas.vertTest.vertexIndex];
            drawer.drawPoint(v.pos, [1, 0, 0]);
            if (glcanvas.vertTest.type == 'getVertexNeighbors') {
                let vs = v.getVertexNeighbors();
                for (let i = 0; i < vs.length; i++) {
                    drawer.drawLine(v.pos, vs[i].pos, [0, 1, 1]);
                    drawer.drawPoint(vs[i].pos, [0, 1, 1]);
                }
            }
        }
        drawer.repaint(glcanvas.camera);
    }

    glcanvas.centerCamera = function() {
        this.camera.centerOnMesh(this.mesh);
    }

    glcanvas.gui = new dat.GUI();
    const gui = glcanvas.gui;
    // Mesh display options menu
    glcanvas.drawEdges = false;
    glcanvas.drawNormals = false;
    glcanvas.drawVertices = false;
    let meshOpts = gui.addFolder('Mesh Display Options');
    ['drawEdges', 'drawNormals', 'drawPoints'].forEach(
        function(s) {
            let evt = meshOpts.add(glcanvas, s);
            evt.onChange(function() {
                requestAnimFrame(glcanvas.repaint);
            });
        }
    );

    let simpleRepaint = function() {
        requestAnimFrame(glcanvas.repaint);
    }

    // Add tests for mesh traversal
    let travTests = gui.addFolder('Traversal Tests');
    let vertTests = travTests.addFolder('Vertex Tests');
    glcanvas.vertTest = {'vertexIndex':0, 'showResult':false, 'type':'getVertexNeighbors'};
    glcanvas.vertTest.gui = vertTests;
    vertTests.add(glcanvas.vertTest, 'vertexIndex').onChange(function(i) {
        let maxi = glcanvas.mesh.vertices.length-1;
        if (i >= maxi) {
            glcanvas.vertTest.vertexIndex = maxi;
        }
        if (i < 0) {
            glcanvas.vertTest.vertexIndex = 0;
        }
        requestAnimFrame(glcanvas.repaint);
    });
    vertTests.add(glcanvas.vertTest, 'type', ['getVertexNeighbors']).onChange(simpleRepaint);
    vertTests.add(glcanvas.vertTest, 'showResult').onChange(simpleRepaint);

    gui.add(glcanvas.mesh, 'saveOffFile').onChange(simpleRepaint);

    requestAnimationFrame(glcanvas.repaint);
}
