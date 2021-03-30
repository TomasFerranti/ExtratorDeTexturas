// Este script é responsável por fornecer diversas funções auxiliares úteis

// -----------------------
// ÚTEIS AO JAVASCRIPT

// Cria um cópia de um array (JS) de arrays (numjs) para acabar com possíveis referências indesejadas
function criarCopia(arr){
    var novoArr = [];
    for (var i = 0; i < arr.length; i++) {
        if(typeof(arr[i])=='number'){
            novoArr.push(arr[i]);      
        }else{
            novoArr.push(arr[i].clone());            
        }
    }
    return novoArr;
}

// Criar um objeto imagedata para a texturar a partir do buffer
function criarImagem(w,h){
    // Criar o elemento escondido da imagem da textura a ser preenchida
    var canvasEscondido = document.createElement('canvas');
    var contextoEscondido = canvasEscondido.getContext('2d');
    canvasEscondido.width = texCanvas.width;
    canvasEscondido.height = texCanvas.height;
    var imgEscondido = contextoEscondido.createImageData(w,h);
    return imgEscondido;
}

// Transformar um objeto imagedata em img
function imagedataParaImage(imagedataEscondido) {
    var canvasEscondido = document.createElement('canvas');
    var ctxEscondido = canvasEscondido.getContext('2d');
    canvasEscondido.width = imagedataEscondido.width;
    canvasEscondido.height = imagedataEscondido.height;
    ctxEscondido.putImageData(imagedataEscondido, 0, 0);

    var imageEscondido = new Image();
    imageEscondido.src = canvasEscondido.toDataURL();
    return imageEscondido;
}

// Limpar as variáveis de camera
function limparVarCamera(){
    statusCalibracao = 'naoCalculada';
    pontosDeFuga = [];
    C = new THREE.Vector3();  
    baseXYZ = new THREE.Matrix3();
    CO = new THREE.Vector2();
    document.getElementById('output').innerHTML = 'Realize o cálculo da câmera para <br/> as variáveis aparecerem aqui.';
}

// Limpar os pontos do canvas
function limparPontosCanvas(){
    pontosGuia = [[],[],[]];
    pontosExtrair = [];
}

// Limpar todas as variáveis, câmera e pontos guias
function limparTodasVar(){
    limparPontosCanvas();
    limparVarCamera();
}

// Desenha uma linha no canvas da imagem
function reta(A,B,cor){
	imgCtx.strokeStyle = cor;
	imgCtx.lineWidth = 3;
	imgCtx.beginPath();
	imgCtx.moveTo(A.x,A.y);
	imgCtx.lineTo(B.x,B.y);
	imgCtx.stroke();
};

// Desenha um ponto no canvas da imagem
function ponto(cx,cy,raio,cor){
	imgCtx.beginPath();
	imgCtx.arc(cx,cy, raio, 0, Math.PI * 2, false);
	imgCtx.fillStyle = cor;
	imgCtx.fill();
};

// Arredonda um número 'x' para 'n' casas decimais
function arredondar(x,n){
    return (Math.round((10**n)*x)/(10**n));
}

// Verificar se dois arrays são iguais
function arr_igual(a1, a2){
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

// Calcula a área do triangulo delimitado pelos três pontos no R^2
function area_triangulo(p,q,r){
    return(p.x*q.y + q.x*r.y + r.x*p.y - p.y*q.x - q.y*r.x - r.y*p.x);
}

// Calcula a interseção da reta determinada por dois segmentos de reta
// Esses segmentos são determinados por dois pontos cada, 'p' e 'q' para o primeiro, 'r' e 's' para o segundo
function inter_retas(p,q,r,s){
    var a1 = area_triangulo(p, q, r);
    var a2 = area_triangulo(q, p, s);
    var amp = a1/(a1+a2);
    var result = new THREE.Vector2();
    return result.addVectors(r.multiplyScalar(1-amp),s.multiplyScalar(amp));
}

// Projeta o vetor 'Va' no vetor 'Vb' e adiciona uma posição 'q'
function proj(Va, Vb, q){
    var c = Va.x*Vb.x + Va.y*Vb.y;
    var v = Vb.x*Vb.x + Vb.y*Vb.y;
    var P = Vb.multiplyScalar(c/v);
    return (P.addVectors(P,q));
}

// Adiciona uma terceira coordenada zero ao 'vector'
function adicHom(vector){
    var result = new THREE.Vector3(vector.x,vector.y,0);
    return(result);
}

// Remove a terceira coordenada do 'Vector'
function remHom(vector){
    var result = new THREE.Vector2(vector.x,vector.y)
    return(result);
}

// Desprojeta um 'vector' do canvas da imagem dado seu 'plano' no espaço e a profundidade deste plano
function desprojetarTela(vector,plano,prof) {
    vector = adicHom(vector);
    var Q = vector.subVectors(vector,C);
    Q = Q.applyMatrix3(baseXYZ.clone().transpose());
    switch(plano){
        case 'YZ':
            Q.multiplyScalar(prof/Q.x);
            break;
        case 'XZ':
            Q.multiplyScalar(prof/Q.y);
            break;
        case 'XY':
            Q.multiplyScalar(prof/Q.z);
            break;
        default:
            // pass
    }
    return(Q);
}
  
// Projeta um 'vector' do sistema de coordenadas do espaço na tela
function projetarTela(vector){
    var Q = vector.applyMatrix3(baseXYZ);
    Q.multiplyScalar(-C.z/Q.z);
    Q.addVectors(Q,C);
    Q = remHom(Q.clone());
    return(Q); 
}

// Dado um ponto e um segmento de reta (definido por dois pontos), calcula a distância
function distanciaSegmento(x,y,x1,y1,x2,y2){
    var A = x - x1;
    var B = y - y1;
    var C = x2 - x1;
    var D = y2 - y1;
    var dot = A * C + B * D;
    var len_sq = C * C + D * D;
    var param = -1;
    if (len_sq != 0)
        param = dot / len_sq;
    
    var xx, yy;
    if (param < 0) {
        xx = x1;
        yy = y1;
    }else if(param > 1) {
        xx = x2;
        yy = y2;
    }else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }
    var dx = x - xx;
    var dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

// Obtém os dois pontos pertencentes aos segmentos mais próximos do mouse
function segmentoMaisProximo(mouse){
    var ci, cj, cd;
    var dist = 20000;
    for(var j=0; j<planos.length;j++){
        for(var i=0; i<4; i++){
            cd = distanciaSegmento(mouse.x, mouse.y,
                                   planos[j].v[i].x, planos[j].v[i].y,
                                   planos[j].v[(i+1)%4].x, planos[j].v[(i+1)%4].y);
            if(cd<dist){
                dist = cd;
                ci = i;
                cj = j;
            }
        }
    }
    return [cj, ci];
}

// Criar o objeto do THREE a partir de um array
function criarObjeto(arr){
    switch(arr.length){
        case 2:
            var objeto = new THREE.Vector2(arr[0],arr[1]);
            break;
        case 3:
            var objeto = new THREE.Vector3(arr[0],arr[1],arr[2]);
            break;
        case 9:
            var objeto = new THREE.Matrix3();
            objeto['elements'] = arr;
            break;
        default:
    }
    return(objeto);
}
// -----------------------