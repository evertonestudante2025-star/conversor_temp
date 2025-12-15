const KEY = '3983822264aad2610d72f0f12b295ebb';

// Elementos
const cInput = document.getElementById('cTemp');
const fInput = document.getElementById('fTemp');
const displayTemp = document.getElementById('displayTemp');
const mercury = document.getElementById('mercury');
const mercBulb = document.getElementById('mercBulb');
const thermo = document.getElementById('thermo');
const particlesContainer = document.getElementById('particles-container');

// Camadas Visuais
const bgColorLayer = document.getElementById('bg-color-layer');
const iceLayer = document.getElementById('ice-layer'); // A camada de gelo
const heatLayer = document.getElementById('heat-layer');
const btnNeon = document.getElementById('searchBtn');

// Estado das partículas
let currentParticleType = 'none';

/* --- 1. LÓGICA DE EFEITOS E CORES --- */

function updateVisualEffects(temp) {
  
  // A. MAPA DE CORES (Sem Verde/Ciano estranho)
  // Intervalos:
  // -100 a -20: Azul Profundo (230) -> Azul Claro (200)
  // -20 a 10:   Azul Claro (200) -> Cinza/Branco (Derretendo)
  // 10 a 30:    Cinza -> Laranja Claro
  // 30 a 100:   Laranja -> Vermelho Escuro (0)

  let hue, saturation, lightness;

  if (temp <= -20) {
    // Frio Extremo
    hue = mapRange(temp, -100, -20, 230, 200);
    saturation = 80;
    lightness = mapRange(temp, -100, -20, 10, 30); // Mais escuro quanto mais frio
  } else if (temp <= 10) {
    // Derretendo (Transição para Neutro)
    hue = 200;
    saturation = mapRange(temp, -20, 10, 80, 0); // Perde cor até ficar cinza
    lightness = mapRange(temp, -20, 10, 30, 50); // Fica mais claro
  } else if (temp <= 40) {
    // Esquenta (Cinza para Laranja)
    hue = 30;
    saturation = mapRange(temp, 10, 40, 0, 90); // Ganha cor laranja
    lightness = mapRange(temp, 10, 40, 50, 40);
  } else {
    // Calor Extremo
    hue = mapRange(temp, 40, 100, 30, 0); // Laranja para Vermelho
    saturation = 100;
    lightness = mapRange(temp, 40, 100, 40, 15); // Escurece no calor infernal
  }

  const colorString = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  bgColorLayer.style.backgroundColor = colorString;

  const accentColor = `hsl(${hue}, 100%, 60%)`;
  mercury.style.fill = accentColor;
  mercBulb.style.fill = accentColor;
  btnNeon.style.borderColor = accentColor;
  btnNeon.style.boxShadow = `0 0 15px ${accentColor}`;
  btnNeon.style.color = accentColor;

  // B. EFEITO DE GELO REALISTA (Máscara Radial)
  // Em -100: Buraco é 0% (Tela toda congelada)
  // Em 0: Buraco é 100% (Sem gelo no centro)
  if (temp < 5) {
    // Quanto mais frio, menor o valor de 'coverage' (buraco visível)
    // -100 graus = 10% de visão (quase fechado)
    // 0 graus = 150% de visão (totalmente aberto)
    let coverage = mapRange(temp, -100, 5, 10, 150);
    coverage = Math.max(0, coverage); // Não deixa ser negativo
    
    // Atualiza a variável CSS que controla a máscara
    document.documentElement.style.setProperty('--ice-coverage', coverage + '%');
    iceLayer.style.opacity = 1;
  } else {
    // Acima de 5 graus, remove o gelo
    document.documentElement.style.setProperty('--ice-coverage', '200%');
    iceLayer.style.opacity = 0;
  }

  // C. EFEITO DE CALOR
  if (temp > 35) {
    const heatOp = mapRange(temp, 35, 90, 0, 0.8);
    heatLayer.style.opacity = Math.min(heatOp, 1);
  } else {
    heatLayer.style.opacity = 0;
  }

  // D. CONTROLE DE PARTÍCULAS
  let newParticleType = 'none';
  
  if (temp <= 0) {
    newParticleType = 'snow';
  } else if (temp > 0 && temp <= 20) {
    newParticleType = 'rain'; // Derretendo
  } else if (temp > 35) {
    newParticleType = 'fire';
  }

  // Se mudou o tipo, limpa o container para não misturar Fogo com Gelo
  if (newParticleType !== currentParticleType) {
    particlesContainer.innerHTML = ''; 
    currentParticleType = newParticleType;
  }
}

function mapRange(value, inMin, inMax, outMin, outMax) {
  return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

/* --- 2. GERADOR DE PARTÍCULAS --- */

function createParticle() {
  if (currentParticleType === 'none') return;

  const p = document.createElement('div');
  const x = Math.random() * 100; // Posição X aleatória

  if (currentParticleType === 'snow') {
    p.className = 'snowflake';
    p.innerHTML = '❄';
    p.style.left = x + 'vw';
    p.style.fontSize = (Math.random() * 15 + 10) + 'px';
    p.style.animationDuration = (Math.random() * 3 + 3) + 's'; // 3s a 6s

  } else if (currentParticleType === 'rain') {
    p.className = 'raindrop';
    p.style.left = x + 'vw';
    p.style.height = (Math.random() * 15 + 10) + 'px';
    p.style.animationDuration = (Math.random() * 0.3 + 0.4) + 's'; // Rápido

  } else if (currentParticleType === 'fire') {
    p.className = 'fire-particle';
    p.style.left = x + 'vw';
    // Cores quentes aleatórias
    const rCol = Math.random() > 0.5 ? '#ff4500' : '#ff8c00';
    p.style.background = `radial-gradient(circle, ${rCol} 0%, transparent 80%)`;
    const size = Math.random() * 20 + 5;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
  }

  particlesContainer.appendChild(p);
  // Limpa do DOM
  setTimeout(() => p.remove(), 6000);
}

// Loop de partículas
setInterval(createParticle, 80); 


/* --- 3. TERMÔMETRO E INPUTS --- */

function updateThermo(temp) {
  displayTemp.innerText = temp.toFixed(1);
  
  // Escala Visual (-100 a 100)
  // Total range = 200
  const visualTemp = Math.max(-100, Math.min(100, temp));
  const percentage = (visualTemp - (-100)) / 200; 
  const h = percentage * 150; // Altura do tubo
  
  mercury.setAttribute('y', 170 - h);
  mercury.setAttribute('height', h);

  updateVisualEffects(temp);
}

function convert(reverse = false) {
  if (reverse) {
    const t = parseFloat(fInput.value);
    if (!isNaN(t)) {
      cInput.value = ((t - 32) * 5 / 9).toFixed(1);
      updateThermo(parseFloat(cInput.value));
    }
  } else {
    const t = parseFloat(cInput.value);
    if (!isNaN(t)) {
      fInput.value = (t * 9 / 5 + 32).toFixed(1);
      updateThermo(t);
    }
  }
}
cInput.addEventListener('input', () => convert(false));
fInput.addEventListener('input', () => convert(true));


/* --- 4. ARRASTAR (DRAG) --- */
let dragging = false;
function moveThermo(yClient) {
  const rect = thermo.getBoundingClientRect();
  const y = yClient - rect.top;
  
  // Mapeia pixel (170 a 20) para graus (-100 a 100)
  const heightClicked = 170 - y;
  const percentage = Math.max(0, Math.min(1, heightClicked / 150));
  const temp = percentage * 200 - 100; // Range de 200 graus

  cInput.value = temp.toFixed(1);
  convert(false);
}

thermo.addEventListener('mousedown', (e) => { dragging = true; moveThermo(e.clientY); });
window.addEventListener('mousemove', (e) => { if(dragging) moveThermo(e.clientY); });
window.addEventListener('mouseup', () => dragging = false);
thermo.addEventListener('touchstart', (e) => { dragging = true; moveThermo(e.touches[0].clientY); e.preventDefault(); }, {passive: false});
window.addEventListener('touchmove', (e) => { if(dragging) { moveThermo(e.touches[0].clientY); e.preventDefault(); } }, {passive: false});
window.addEventListener('touchend', () => dragging = false);


/* --- 5. API CLIMA --- */
const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const suggestions = document.getElementById('suggestions');
const cityName = document.getElementById('cityName');
let debounce;

cityInput.addEventListener('input', () => {
  clearTimeout(debounce);
  suggestions.innerHTML = '';
  const q = cityInput.value.trim();
  if (q.length < 3) return;
  debounce = setTimeout(async () => {
    try {
      const res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=5&appid=${KEY}`);
      const data = await res.json();
      suggestions.innerHTML = '';
      data.forEach(c => {
        const li = document.createElement('li');
        li.textContent = `${c.name}, ${c.country}`;
        li.onclick = () => { cityInput.value = li.textContent; suggestions.innerHTML = ''; searchCity(li.textContent); };
        suggestions.appendChild(li);
      });
    } catch {}
  }, 300);
});

async function searchCity(q) {
  const query = q || cityInput.value;
  if(!query) return;
  searchBtn.innerHTML = '...';
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query)}&units=metric&lang=pt&appid=${KEY}`);
    const data = await res.json();
    if(data.main) {
      cityName.innerText = `${data.name}, ${data.sys.country}`;
      cInput.value = data.main.temp.toFixed(1);
      convert(false);
    }
  } catch(e) { alert('Cidade não encontrada'); } finally { searchBtn.innerHTML = '<i class="bi bi-search"></i> Atualizar'; }
}
searchBtn.onclick = () => searchCity();

// Inicia neutro em 20 graus
cInput.value = '20.0';
updateThermo(20);