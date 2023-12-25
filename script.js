let mouseX = 0;
let mouseY = 0;
let trailEnabled = false;
let lastX = 0;
let lastY = 0;
let speedMultiplier = 1;
let individualTrailEnabled = false;
const trailElements = [];

document.addEventListener('keydown', (event) => {
    if (event.key === 'o') {
        individualTrailEnabled = !individualTrailEnabled;

        // If individualTrailEnabled is set to false, remove all existing trail elements
        if (!individualTrailEnabled) {
            trailElements.forEach((trailElement) => {
                document.body.removeChild(trailElement);
            });
            trailElements.length = 0; // Clear the trailElements array
        }
    }
});

document.getElementById('speed-slider').addEventListener('input', function(event) {
    speedMultiplier = parseFloat(event.target.value);

    // Atualiza o valor exibido ao lado do controle deslizante
    document.getElementById('speed-value').textContent = `${speedMultiplier}x`;
});

// Create the star element
const starElement = document.createElement('div');
starElement.style.position = 'absolute';
starElement.style.width = '20px';
starElement.style.height = '20px';
starElement.style.borderRadius = '50%';
starElement.style.backgroundColor = '#fff';
starElement.style.boxShadow = '0 0 10px #fff, 0 0 20px #fff, 0 0 30px #fff, 0 0 40px #fff';
starElement.style.pointerEvents = 'none';
document.body.appendChild(starElement);

document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;

    // Update the position of the star element
    starElement.style.left = `${mouseX}px`;
    starElement.style.top = `${mouseY}px`;

    // Update the position of the zones
    if (zonesVisible) {
        for (let i = 0; i < 3; i++) {
            const zone = document.getElementById(`zone-${i}`);
            if (zone) {
                zone.style.left = `${mouseX - (i + 1) * 50}px`; // Center the zone on the mouse
                zone.style.top = `${mouseY - (i + 1) * 50}px`; // Center the zone on the mouse
            }
        }
    }
});
// Rest of your code...

document.addEventListener('keydown', (event) => {
    if (event.key === 'p') {
        trailEnabled = !trailEnabled;

        // If trailEnabled is set to false, remove all existing trail elements
        if (!trailEnabled) {
            const trailElements = document.querySelectorAll('.trail');
            trailElements.forEach((trailElement) => {
                document.body.removeChild(trailElement);
            });
        }
    }
});
let zonesVisible = false;

document.addEventListener('keydown', (event) => {
    if (event.key === 'z') {
        zonesVisible = !zonesVisible;
        if (zonesVisible) {
            createZones();
        } else {
            removeZones();
        }
    }
});

const planets = [];

document.getElementById('planet-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get the form values
    const planetCount = parseInt(document.getElementById('planet-count').value);
    const distanceRange = parseInt(document.getElementById('distance-range').value);

    // Hide the form
    document.getElementById('planet-form').style.display = 'none';

    // Generate the planets
    for (let i = 0; i < planetCount; i++) {
        const planet = document.createElement('div');
        planet.className = 'planet';
        planet.style.width = '20px';
        planet.style.height = '20px';
        planet.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
        document.body.appendChild(planet);

        planets.push({
            element: planet,
            speed: 0.02 / Math.sqrt(distanceRange), // inversely proportional to the square root of the distance
            radius: 50 + (i * 20) + Math.random() * 50, // add a random distance up to 50 pixels
            eccentricity: 0.1 + Math.random() * 0.3,
            inclination: Math.random() * 2 * Math.PI, // add inclination
            phase: Math.random() * 2 * Math.PI // add a random phase
        });
    }

    // Show the speed control
    document.getElementById('speed-control').style.display = 'block';

    // Start the animation
    update();
});
function update() {
    [...planets].forEach((planet, index) => {
        const angle = (Date.now() * planet.speed * speedMultiplier) % (2 * Math.PI);
        const x = mouseX + planet.radius * Math.cos(angle) * Math.cos(planet.inclination) * (1 + planet.eccentricity);
        const y = mouseY + planet.radius * Math.sin(angle) * Math.sin(planet.inclination) * (1 - planet.eccentricity);
        planet.element.style.left = `${x}px`;
        planet.element.style.top = `${y}px`;

        // Adjust the size of the planet based on its position in the orbit
        const scale = 1 - Math.sin(angle + planet.phase) / 2; // add the phase to the angle
        planet.element.style.transform = `scale(${scale})`;

        // Decrease the radius of the planet's orbit to make it move closer to the sun
        planet.radius = Math.max(planet.radius - 0.05, 0);


        if (individualTrailEnabled) {
            const trailElement = document.createElement('div');
            trailElement.style.position = 'absolute';
            trailElement.style.width = `2px`; // fixed trail size
            trailElement.style.height = `2px`; // fixed trail size
            trailElement.style.background = window.getComputedStyle(planet.element).backgroundColor;
            trailElement.style.left = `${x}px`;
            trailElement.style.top = `${y}px`;
            document.body.appendChild(trailElement);
        
            // Add the new trail element to the array
            trailElements.push(trailElement);
        
// Remove the oldest trail element if there are more than 20 * number of planets
if (trailElements.length > 90 * planets.length) {
    const oldestTrailElement = trailElements.shift();
    document.body.removeChild(oldestTrailElement);
}
        }



        planet.element.style.transform = `scale(${scale})`;

        // Verifica se o planeta está muito próximo do mouse
        const distanceToMouse = Math.sqrt(Math.pow(x - mouseX, 2) + Math.pow(y - mouseY, 2));
        if (distanceToMouse < 10) { // 10 é a distância mínima para a "explosão"
            // Remove o planeta do DOM
            if (planet.element.parentNode) {
                planet.element.parentNode.removeChild(planet.element);
            }
            // Remove o planeta do array de planetas
            planets.splice(index, 1);
        }

        // Verifica se o planeta está muito próximo de outro planeta
        planets.forEach((otherPlanet, otherIndex) => {
            if (planet === otherPlanet) return; // Não compara o planeta consigo mesmo
            const otherPlanetX = parseFloat(otherPlanet.element.style.left);
            const otherPlanetY = parseFloat(otherPlanet.element.style.top);
            const distanceToOtherPlanet = Math.sqrt(Math.pow(x - otherPlanetX, 2) + Math.pow(y - otherPlanetY, 2));
            if (distanceToOtherPlanet < 10) { // 10 é a distância mínima para a "explosão"
                // Remove o planeta do DOM
                planet.element.parentNode.removeChild(planet.element);
                // Remove o planeta do array de planetas
                const planetIndex = planets.indexOf(planet);
                if (planetIndex > -1) {
                    planets.splice(planetIndex, 1);
                }
            }
        });

        if (trailEnabled) {
            const trailElement = document.createElement('div');
            trailElement.style.position = 'absolute';
            trailElement.style.width = `${2 * scale}px`; // scale the trail size
            trailElement.style.height = `${2 * scale}px`; // scale the trail size
            trailElement.style.background = window.getComputedStyle(planet.element).backgroundColor;
            trailElement.style.left = `${x}px`;
            trailElement.style.top = `${y}px`;
            document.body.appendChild(trailElement);

            // Draw a line from the last position to the current position to create a continuous trail
            if (lastX && lastY) {
                const lineElement = document.createElement('div');
                lineElement.style.position = 'absolute';
                lineElement.style.width = `${Math.sqrt(Math.pow(x - lastX, 2) + Math.pow(y - lastY, 2)) * scale}px`; // length of the line
                lineElement.style.height = `${2 * scale}px`; // thickness of the line
                lineElement.style.background = window.getComputedStyle(planet.element).backgroundColor;
                lineElement.style.transformOrigin = 'left top';
                lineElement.style.transform = `rotate(${Math.atan2(y - lastY, x - lastX)}rad)`;
                lineElement.style.left = `${lastX}px`;
                lineElement.style.top = `${lastY}px`;
                document.body.appendChild(lineElement);
            }

            lastX = x;
            lastY = y;
        } else {
            lastX = 0;
            lastY = 0;
        }
    });

    if (planets.length > 0) {
        requestAnimationFrame(update);
    }
}
function generateStars() {
    const starCount = Math.floor(Math.random() * 2000) + 1000; // Número de estrelas a serem geradas, entre 1000 e 3000
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';

        // Gera um tamanho aleatório entre 1 e 5
        const size = Math.random() * 4 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;

        // Gera uma posição aleatória
        let x = Math.random() * window.innerWidth;
        let y = Math.random() * window.innerHeight;

        // Ajusta a posição para ter mais aglomeração nas bordas e menos no centro
        const distanceToCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
        const adjustment = 1 + (distanceToCenter / maxDistance); // Ajuste para empurrar as estrelas para longe do centro

        x = centerX + (x - centerX) * adjustment;
        y = centerY + (y - centerY) * adjustment;

        star.style.left = `${x}px`;
        star.style.top = `${y}px`;

        document.body.appendChild(star);
    }
}
function createZones() {
    const zones = ['Non-Habitable', 'Habitable', 'Non-Habitable'];
    const colors = ['red', 'green', 'cyan'];

    zones.forEach((zone, index) => {
        const div = document.createElement('div');
        div.id = `zone-${index}`;
        div.style.position = 'absolute';
        div.style.border = `2px solid ${colors[index]}`;
        div.style.borderRadius = '50%';
        div.style.width = `${(index + 1) * 100}px`; // Updated size
        div.style.height = `${(index + 1) * 100}px`; // Updated size
        div.style.zIndex = 999 - index; // Ensure that the zones are stacked correctly
        div.style.pointerEvents = 'none'; // Make sure the zones don't interfere with mouse events
        div.style.color = colors[index];
        div.style.textAlign = 'center';
        div.style.lineHeight = `${(index + 1) * 100}px`; // Vertically center the text
        div.textContent = zone;
        div.style.backgroundColor = index === 2 ? 'rgba(0, 255, 255, 0.2)' : (index === 1 ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)');zone
        document.body.appendChild(div);
    });
}

function removeZones() {
    for (let i = 0; i < 3; i++) {
        const zone = document.getElementById(`zone-${i}`);
        if (zone) {
            document.body.removeChild(zone);
        }
    }
}
generateStars();
update();