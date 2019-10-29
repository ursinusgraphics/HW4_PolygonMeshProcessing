/**
 * Skeleton code implementation for a half-edge mesh
 */


function HEdge() {
    this.head = null; // Head vertex
    this.face = null; // Left face
    this.pair = null; // Half edge on opposite face
    this.next = null; // Next half edge in CCW order around left face
}

function HFace() {
    this.h = null; // Any HEdge on this face

    /**
     * Get a list of vertices attached to this face
     */
    this.getVertices = function() {
        let h = this.h.next;
        let vertices = [this.h.head];
        while (h != this.h) {
            vertices.push(h.head);
            h = h.next;
        }
        return vertices;
    }

    this.getNormal = function () {
        // TODO: Fill this in
        return glMatrix.vec3.create();
    }
}

function HVertex(pos, color) {
    this.pos = pos;
    this.color = color;
    this.h = null;

    this.getNormal = function () {
        // TODO: Fill this in
        return glMatrix.vec3.create();
    }
}


function HedgeMesh() {
    PolyMesh(this); // Initialize common functions/variables
    
    /**
     * @returns {I} A NumTrisx3 Uint16Array of indices into the vertex array
     */
    this.getTriangleIndices = function() {
        // TODO: Fill this in for rendering
        /*let NumTris = 0;
        for (let i = 0; i < this.faces.length; i++) {
            NumTris += this.faces[i].edges.length - 2;
        }
        let I = new Uint16Array(NumTris*3);
        let i = 0;
        let faceIdx = 0;
        //Now copy over the triangle indices
        while (i < NumTris) {
            let verts = this.faces[faceIdx].getVertices();
            for (let t = 0; t < verts.length - 2; t++) {
                I[i*3] = verts[0].ID;
                I[i*3+1] = verts[t+1].ID;
                I[i*3+2] = verts[t+2].ID;
                i++;
            }
            faceIdx++;
        }
        return I;*/
    }

    /**
     * @returns {I} A NEdgesx2 Uint16Array of indices into the vertex array
     */
    this.getEdgeIndices = function() {
        // TODO: Fill this in for rendering
        /*
        let NumEdges = this.edges.length;
        let I = new Uint16Array(NumEdges*2);
        for (let i = 0; i < NumEdges; i++) {
            I[i*2] = this.edges[i].v1.ID;
            I[i*2+1] = this.edges[i].v2.ID;
        }
        return I;*/
    }

    /**
     * Given two vertex objects representing an edge,
     * and a face to the left of that edge, initialize
     * a half edge object and add it to the list of edges
     * 
     * @param {HVertex} v1 First vertex on edge
     * @param {HVertex} v2 Second vertex on edge
     * @param {HFace} face Face to the left of edge
     * 
     * @returns {HEdge} The constructed half edge
     */
    this.addHalfEdge = function(v1, v2, face) {
        const hedge = new HEdge();
        hedge.vertex = v2; // Points to head vertex of edge
        hedge.face = face;
        v1.h = hedge; // Let tail vertex point to this edge
        this.edges.push(hedge);
        return hedge;
    }

    /////////////////////////////////////////////////////////////
    ////                INPUT/OUTPUT METHODS                /////
    /////////////////////////////////////////////////////////////

    /**
     * Load in an OFF file from lines and convert into
     * half edge mesh format. Crucially, this function assumes
     * a consistently oriented mesh with vertices specified 
     * in CCW order
     */
    this.loadFileFromLines = function(lines) {
        let res = loadFileFromLines(lines);
        this.vertices.length = 0;
        this.edges.length = 0;
        this.faces.length = 0;

        // Step 1: Add vertices
        for (let i = 0; i < res['vertices'].length; i++) {
            let V = new HVertex(res['vertices'][i], res['colors'][i]);
            V.ID = this.vertices.length;
            this.vertices.push(V);
        }

        let str2Hedge = {};

        // Step 2: Add faces and halfedges
        for (let i = 0; i < res['faces'].length; i++) {
            const face = new HFace();
            this.faces.push(face);
            let vertsi = res['faces'].map(function(v) {
                this.vertices[v];
            });

            // Add halfedges
            for (let k = 0; k < vertsi.length; k++) {
                const v1 = vertsi[k];
                const v2 = vertsi[(k+1)%vertsi.length];
                // Add each half edge
                const hedge = this.addHalfEdge(v1, v2, face);
                // Store half edge in hash table
                str2Hedge[v1.ID+"_"+v2.ID] = hedge;
                face.h = hedge;
            }

            // Link edges together around face in CCW order
            // assuming each vertex points to the half edge
            // starting at that vertex (which addHalfEdge has done)
            for (let k = 0; k < vertsi.length; k++) {
                vertsi[k].h.next = vertsi[(k+1)%vertsi.length].h;
            }
        }

        // Step 3: Add links between opposite half edges if 
        // they exist (otherwise, there is a boundary edge)
        for (const key in str2Hedge) {
            const v1v2 = key.split("_");
            const other = v1v2[1]+"_"+v1v2[0];
            if (other in str2Hedge) {
                str2Hedge[key].opposite = str2Hedge[other];
            }
        }

        this.needsDisplayUpdate = true;
    }
}