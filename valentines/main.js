// ================= MUSIC + ENTER =================
const music = document.getElementById("bgMusic");
const startScreen = document.getElementById("startScreen");
const enterBtn = document.getElementById("enterBtn");

enterBtn.addEventListener("click", () => {
  music.volume = 0;
  music.play().then(() => {
    let v = 0;
    const fade = setInterval(() => {
      if (v < 0.4) {
        v += 0.02;
        music.volume = v;
      } else clearInterval(fade);
    }, 200);
  });
  startScreen.style.display = "none";
});

// ================= SCENE =================
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xffc0e6, 8, 100);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 18);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffd6f2);
document.body.appendChild(renderer.domElement);

// ================= LIGHT =================
scene.add(new THREE.AmbientLight(0xffcce6, 1.4));
const light = new THREE.PointLight(0xffffff, 2);
light.position.set(10,10,10);
scene.add(light);

// ================= PLATFORM =================
const platform = new THREE.Mesh(
  new THREE.CylinderGeometry(7,7,1,32),
  new THREE.MeshStandardMaterial({color:0xff99cc})
);
platform.position.y = -2;
scene.add(platform);

// ================= FLOATING HEARTS =================
const hearts = [];
for(let i=0;i<250;i++){
  const h = new THREE.Mesh(
    new THREE.SphereGeometry(0.12,8,8),
    new THREE.MeshBasicMaterial({color:0xff69b4})
  );
  h.position.set((Math.random()-0.5)*40, Math.random()*20, (Math.random()-0.5)*40);
  hearts.push(h);
  scene.add(h);
}

// ================= PHOTO CRYSTALS =================
const loader = new THREE.TextureLoader();
const crystals = [];
const totalPhotos = 11;
const radius = 11;

for(let i=1;i<=totalPhotos;i++){
  const texture = loader.load(`./images/picture${i}.jpg`);

  const crystal = new THREE.Mesh(
    new THREE.BoxGeometry(2.3,3.3,0.2),
    new THREE.MeshStandardMaterial({
      map:texture,
      emissive:0xff99cc,
      emissiveIntensity:0.6
    })
  );

  const angle = (i/totalPhotos)*Math.PI*2;
  crystal.position.set(Math.cos(angle)*radius, 0, Math.sin(angle)*radius);
  crystal.lookAt(0,0,0);
  crystal.userData.originalPosition = crystal.position.clone();

  crystals.push(crystal);
  scene.add(crystal);
}

// ================= LETTER PEDESTAL =================
const letter = new THREE.Mesh(
  new THREE.CylinderGeometry(1.2,1.2,0.5,32),
  new THREE.MeshStandardMaterial({color:0xffffff, emissive:0xff99cc})
);
letter.position.set(0,0,0);
scene.add(letter);

// ================= GIFT BOX =================
const gift = new THREE.Mesh(
  new THREE.BoxGeometry(1.5,1.5,1.5),
  new THREE.MeshStandardMaterial({color:0xff66aa})
);
gift.position.set(0,1.5,-5);
scene.add(gift);

// ================= RAYCAST CLICK =================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let zoomed = null;

window.addEventListener("click", (event)=>{
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects([...crystals, letter, gift]);

  if(zoomed){
    zoomed.position.copy(zoomed.userData.originalPosition);
    zoomed.scale.set(1,1,1);
    zoomed = null;
    return;
  }

  if(intersects.length>0){
    const obj = intersects[0].object;

    // PHOTO
    if(crystals.includes(obj)){
      zoomed = obj;
      obj.position.set(0,1,4);
      obj.scale.set(3,3,3);
    }

    // LETTER
    if(obj === letter){
      showLetter();
    }

    // GIFT
    if(obj === gift){
      explodeHearts();
    }
  }
});

// ================= LETTER POPUP =================
function showLetter(){
  const div = document.createElement("div");
  div.innerHTML = `
  <div style="
    position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
    background:white;padding:30px;border-radius:20px;
    font-family:serif;width:60%;text-align:center;z-index:50;">
    <h2>My Love ❤️</h2>
    <p>Thank you for being in my life. Every moment with you is magical...</p>
    <button onclick="this.parentElement.remove()">Close</button>
  </div>`;
  document.body.appendChild(div);
}

// ================= HEART EXPLOSION =================
function explodeHearts(){
  for(let i=0;i<50;i++){
    const h = new THREE.Mesh(
      new THREE.SphereGeometry(0.15,8,8),
      new THREE.MeshBasicMaterial({color:0xff0000})
    );
    h.position.copy(gift.position);
    scene.add(h);

    const dir = new THREE.Vector3(
      (Math.random()-0.5)*0.5,
      Math.random()*0.5,
      (Math.random()-0.5)*0.5
    );

    setInterval(()=>{ h.position.add(dir); },30);
  }
}

// ================= ANIMATION =================
let t=0;
function animate(){
  requestAnimationFrame(animate);
  t+=0.01;

  crystals.forEach(c=>{
    if(c!==zoomed) c.rotation.y+=0.01;
  });

  gift.rotation.y+=0.02;
  letter.rotation.y+=0.01;

  hearts.forEach((h,i)=>{
    h.position.y+=Math.sin(t+i)*0.01;
  });

  camera.position.y = Math.sin(t)*0.4 + 2;
  camera.lookAt(0,0,0);

  renderer.render(scene,camera);
}
animate();

// ================= RESIZE =================
window.addEventListener("resize",()=>{
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
