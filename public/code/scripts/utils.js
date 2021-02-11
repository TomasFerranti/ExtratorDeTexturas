// HTML stuff
function getText(text) {
    return (text ? " ✓" : "");
}

// JS variable stuff
function clear_camera(){
    pontos_de_fuga = nj.array([]).reshape(-1,2);
    C = nj.array([]).reshape(-1,3);  
    base_XYZ = nj.zeros([3,3]);
    pontos_extrair = nj.array([]).reshape(-1,2);
    document.getElementById('output').innerHTML = "Realize o cálculo da câmera para <br/> as variáveis aparecerem aqui.";
}

function clear_all(){
    pontos_guia = [nj.array([]).reshape(-1,2),nj.array([]).reshape(-1,2),nj.array([]).reshape(-1,2)];
    clear_camera();
}

function arrays_equal(a1, a2){
    if ((a1.shape[0] != a2.shape[0]) || (a1.shape[1] != a2.shape[1])){
        return false;
    }
    for (var i=0; i<a1.shape[0];  i++){
        for (var j=0; j<a1.shape[1]; j++){
            if(a1.get(i,j)!=a2.get(i,j)){
                return false;
            }
        }
    }
    return true;
}

// Drawing stuff
function line(A,B,cor){
	imgCtx.strokeStyle = cor;
	imgCtx.lineWidth = 3;
	imgCtx.beginPath();
	imgCtx.moveTo(A.get(0,0),A.get(0,1));
	imgCtx.lineTo(B.get(0,0),B.get(0,1));
	imgCtx.stroke();
};

function point(cx,cy,raio,cor){
	imgCtx.beginPath();
	imgCtx.arc(cx,cy, raio, 0, Math.PI * 2, false);
	imgCtx.fillStyle = cor;
	imgCtx.fill();
};

// Math stuff
function round(x,n){
    return (Math.round((10**n)*x)/(10**n));
}

function triangle_area(p,q,r){
    return(p.get(0,0) * q.get(0,1) + q.get(0,0) * r.get(0,1) + 
    r.get(0,0) * p.get(0,1) - p.get(0,1) * q.get(0,0) - 
    q.get(0,1) * r.get(0,0) - r.get(0,1) * p.get(0,0)); 
}

function intersect(p,q,r,s){
    var a1 = triangle_area(p, q, r);
    var a2 = triangle_area(q, p, s);
    var amp = a1/(a1+a2);
    return (r.multiply(1-amp).add(s.multiply(amp)));
}

function proj(Va, Vb, q){
    var c = Va.get(0,0)*Vb.get(0,0) + Va.get(0,1)*Vb.get(0,1);
    var v = Vb.get(0,0)*Vb.get(0,0) + Vb.get(0,1)*Vb.get(0,1);
    var P = Vb.multiply(c/v);
    return (P.add(q));
}

function norm(vector){
    return( nj.sum(vector.pow(2))**(1/2));
}

function normalize(vector){
    return(vector.multiply(1/norm(vector)));
}

function add_hom(vector){
    return(nj.array([vector.get(0,0),vector.get(0,1),0]).reshape(1,3));
}

function rem_hom(vector){
    return(nj.array([vector.get(0,0),vector.get(0,1)]).reshape(1,2));
}

function unProject(vector,plano) {
    var Q = add_hom(vector).subtract(C);
    Q = nj.dot(base_XYZ.T,Q.reshape(3,1)).reshape(1,3);
    switch(plano){
        case "X":
            Q = Q.multiply(1/Q.get(0,0));
            break;
        case "Y":
            Q = Q.multiply(1/Q.get(0,1));
            break;
        case "Z":
            Q = Q.multiply(1/Q.get(0,2));
            break;
        default:
            // pass
    }
    return(Q);
}
  
function project(vector){
    var Q = nj.dot(base_XYZ,vector.reshape(3,1)).reshape(1,3);
    Q = Q.multiply(-C.get(0,2)/Q.get(0,2)).add(C);
    Q = rem_hom(Q);
    return(Q); 
}