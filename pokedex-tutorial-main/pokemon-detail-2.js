/* 
single-page application: changes url without loading the page, while navigating pokemon
*/

let currentPokemonId = null;

// DOMContentLoaded: indicates that the HTML document has been completely loaded and parsed
document.addEventListener("DOMContentLoaded", () => {
  const MAX_POKEMONS = 151;
  const pokemonID = new URLSearchParams(window.location.search).get("id"); // get value of id from url
  const id = parseInt(pokemonID, 10); // parse int id(string), 10 -> decimal

  if (id < 1 || id > MAX_POKEMONS) {
    return (window.location.href = "./index.html"); // if id is not in 1 to 151 then it change back the link to ./index.html
  }

  currentPokemonId = id;
  loadPokemon(id);
});

async function loadPokemon(id) {
  try {
    const [pokemon, pokemonSpecies] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) =>
        res.json()
      ), // fetching data for pokemon
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then((res) =>
        res.json()
      ), // fetching data for pokemon species
    ]);
    // whenever load new pokemon, we first empty the previous pokemon details
    const abilitiesWrapper = document.querySelector(
      ".pokemon-detail-wrap .pokemon-detail.move"
    );
    abilitiesWrapper.innerHTML = "";

    if (currentPokemonId === id) {
      displayPokemonDetails(pokemon);
      const flavorText = getEnglishFlavorText(pokemonSpecies);
      document.querySelector(".body3-fonts.pokemon-description").textContent =
        flavorText;

      // navigating pokemon left and right
      const [leftArrow, rightArrow] = ["#leftArrow", "#rightArrow"].map((sel) =>
        document.querySelector(sel)
      ); // select left and right arrow and assign them to leftArrow, rightArrow
      leftArrow.removeEventListener("click", navigatePokemon);
      rightArrow.removeEventListener("click", navigatePokemon);

      if (id !== 1) {
        leftArrow.addEventListener("click", () => {
          navigatePokemon(id - 1);
        }); // navigate on clicking the left arrow to left, only not for when id = 1
      }
      if (id !== 151) {
        rightArrow.addEventListener("click", () => {
          navigatePokemon(id + 1);
        }); // navigate on clicking the right arrow to right, only not for when id = 151
      }

      window.history.pushState({}, "", `./detail.html?id=${id}`); // it changes url without loading the page, while navigating pokemon
    }
    return true;
  } catch (error) {
    console.error("An error occur while fetching pokemon data:", error);
    return false;
  }
}

async function navigatePokemon(id) {
  currentPokemonId = id;
  await loadPokemon(id);
}
/* setting background and type(grass, poison,ghost) color */
const typeColors = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  grass: "#78C850",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  dark: "#EE99AC",
};

function setElementStyles(elements, cssProperty, value) {
  elements.forEach((element) => {
    element.style[cssProperty] = value;
  });
}

/* converting hex to rgba */
/* slice hexcode and parse each slice from hex to int and join tem using ',' 
for #EE99AC, slice(1,3)-EE, slice(3,5)-99, slice(5,7)-AC
*/
function rgbaFromHex(hexColor) {
  return [
    parseInt(hexColor.slice(1, 3), 16),
    parseInt(hexColor.slice(3, 5), 16),
    parseInt(hexColor.slice(5, 7), 16),
  ].join(", ");
}

function setTypeBackgroundColor(pokemon) {
  const mainType = pokemon.types[0].type.name; // get the type of pokemon
  const color = typeColors[mainType]; // get color according to its type

  if (!color) {
    console.warn(`Color not defined for type:${mainType}`);
    return;
  } // if no color is assign, it give warning

  const detailMainElement = document.querySelector(".detail-main"); // Its the main element, everything is inside it
  setElementStyles([detailMainElement], "backgroundColor", color); // setting bgcolor, border color of page
  setElementStyles([detailMainElement], "borderColor", color);

  // set tag background color
  setElementStyles(
    document.querySelectorAll(".power-wrapper > p"),
    "backgroundColor",
    color
  );
  // set stats name(atk,hp...) color
  setElementStyles(
    document.querySelectorAll(".stats-wrap p.stats"),
    "color",
    color
  );
  //set stats progress bar color
  setElementStyles(
    document.querySelectorAll(".stats-wrap .progress-bar"),
    "color",
    color
  );

  /* adding style tag in html's head */
  const rgbaColor = rgbaFromHex(color);
  const styleTag = document.createElement("style");
  // setting color for progress bar
  styleTag.innerHTML = `
  /* ::-webkit-progress-bar :- represents the entire bar of a <progress> element */
    .stats-wrap .progress-bar::-webkit-progress-bar{
        background-color:rgba(${rgbaColor},0.5);
    }
    .stats-wrap .progress-bar::-webkit-progress-value{
        background-color:${color};
    }`;
  document.head.appendChild(styleTag);
}

/* function for display pokemon detail function */
// title form convert -> 1st letter uppercase, other all in lowercase
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
// function to create and append element
function createAndAppendElement(parent, tag, options = {}) {
  const element = document.createElement(tag);
  Object.keys(options).forEach((key) => {
    element[key] = options[key];
  });
  parent.appendChild(element);
  return element;
}

function displayPokemonDetails(pokemon) {
  const { name, id, types, weight, height, abilities, stats } = pokemon; // destructing
  const capitalizePokemonName = capitalizeFirstLetter(name); // title case name and assign it

  document.querySelector("title").textContent = capitalizePokemonName; // give title(that show as title of webpage) pokemon name

  const detailMainElement = document.querySelector(".detail-main");
  detailMainElement.classList.add(name.toLowerCase()); // add class (current name) in main tag

  document.querySelector(".name-wrap .name").textContent =
    capitalizePokemonName; // give pokemon name to heading

  document.querySelector(
    ".pokemon-id-wrap .body2-fonts"
  ).textContent = `#${String(id).padStart(3, "0")}`; // give id 3 digit value padding in start by 0

  const imageElement = document.querySelector(".detail-img-wrapper img");
  imageElement.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${id}.svg`;
  imageElement.alt = name; // give image and alt txt of pokemon

  const typeWrapper = document.querySelector(".power-wrapper"); // adding types
  typeWrapper.innerHTML = ""; // first empty
  types.forEach(({ type }) => {
    // pass parent, tag, options
    createAndAppendElement(typeWrapper, "p", {
      className: `body3-fonts type ${type.name}`, // adding these classes
      textContent: type.name, // adding type name
    }); // for each type
  });

  // height and weight values
  document.querySelector(
    ".pokemon-detail-wrap .pokemon-detail p.body3-fonts.weight"
  ).textContent = `${weight / 10} kg`;
  document.querySelector(
    ".pokemon-detail-wrap .pokemon-detail p.body3-fonts.height"
  ).textContent = `${height / 10} m`;

  const abilitiesWrapper = document.querySelector(
    ".pokemon-detail-wrap .pokemon-detail.move"
  ); // for each ability make a p that and add it to abilities wrapper
  abilities.forEach(({ ability }) => {
    createAndAppendElement(abilitiesWrapper, "p", {
      className: "body3-fonts",
      textContent: ability.name,
    });
  });

  /* starting with stats wrapper */

  const statsWrapper = document.querySelector(".stats-wrapper");
  statsWrapper.innerHTML = ""; // first empty stats wrapper

  const statNameMapping = {
    hp: "HP",
    attack: "ATK",
    defense: "DEF",
    "special-attack": "SATK",
    "special-defense": "SDEF",
    speed: "SPD",
  };

  // append a new stat div inside every stat, inside it add stat name, stat no. and progress
  stats.forEach(({ stat, base_stat }) => {
    const statDiv = document.createElement("div");
    statDiv.className = "stats-wrap";
    statsWrapper.appendChild(statDiv);

    createAndAppendElement(statDiv, "p", {
      className: "body3-fonts stats",
      textContent: statNameMapping[stat.name],
    }); // adding stat name

    createAndAppendElement(statDiv, "p", {
      className: "body3-fonts",
      textContent: String(base_stat).padStart(3, "0"),
    }); // adding stat quantity no., with padding of 3

    createAndAppendElement(statDiv, "progress", {
      className: "progress-bar",
      value: base_stat,
      max: 100,
    }); // adding values for progress bar
  });

  setTypeBackgroundColor(pokemon); // then call func to set color for all
}

function getEnglishFlavorText(pokemonSpecies) {
  for (let entry of pokemonSpecies.flavor_text_entries) {
    if (entry.language.name === "en") {
      let flavor = entry.flavor_text.replace(/\f/g, " ");
      return flavor;
    }
  }
  return "";
}
