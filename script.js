let map;
let marker;

function initMap() {
  // Centraliza o mapa no Maranhão
  const maranhao = { lat: -4.9609, lng: -45.2744 };
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 6,
    center: maranhao,
  });

  // Adiciona um marcador inicial no centro do Maranhão
  marker = new google.maps.Marker({
    position: maranhao,
    map: map,
  });
}

async function fetchDataAndCreateCharts() {
  try {
    const apiUrl =
      "https://cors-anywhere.herokuapp.com/https://dadosabertos.aneel.gov.br/api/3/action/datastore_search?resource_id=4af32411-da8b-492c-ae15-8f615e35d2e2&q=06272793000184";
    const response = await fetch(apiUrl);
    const data = await response.json();
    const records = data.result.records;

    // Extrai os nomes das cidades e dados relevantes
    const municipios = records.map((record) => record.NomMunicipio);
    const reclamacoesRecebidas = records.map(
      (record) => parseInt(record.QtdReclamacoesRecebidas) || 0
    );
    const reclamacoesProcedentes = records.map(
      (record) => parseInt(record.QtdReclamacoesProcedentes) || 0
    );
    const prazoMedioSolucao = records.map(
      (record) => parseFloat(record.NumPrazoMedioSolucao.replace(",", ".")) || 0
    );

    // Popula o dropdown com as cidades
    const citySelect = document.getElementById("citySelect");
    citySelect.innerHTML = municipios
      .map((city) => `<option value="${city}">${city}</option>`)
      .join("");

    // Cria o gráfico de barras para reclamações
    const ctx1 = document.getElementById("reclamacoesChart").getContext("2d");
    new Chart(ctx1, {
      type: "bar",
      data: {
        labels: municipios,
        datasets: [
          {
            label: "Reclamações Recebidas",
            data: reclamacoesRecebidas,
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
          {
            label: "Reclamações Procedentes",
            data: reclamacoesProcedentes,
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    // Cria o gráfico de linha para o prazo médio de solução
    const ctx2 = document.getElementById("prazoMedioChart").getContext("2d");
    new Chart(ctx2, {
      type: "line",
      data: {
        labels: municipios,
        datasets: [
          {
            label: "Prazo Médio de Solução (dias)",
            data: prazoMedioSolucao,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    // Atualiza o mapa e gráficos quando uma cidade é selecionada
    citySelect.addEventListener("change", () => {
      const selectedCity = citySelect.value;
      updateMapAndCharts(selectedCity);
    });

    // Atualização inicial com a primeira cidade
    if (municipios.length > 0) {
      updateMapAndCharts(municipios[0]);
    }
  } catch (error) {
    console.error("Erro ao buscar dados da API:", error);
  }
}

async function updateMapAndCharts(city) {
  try {
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode(
      { address: city + ", Maranhão, Brazil" },
      (results, status) => {
        if (status === "OK") {
          const location = results[0].geometry.location;

          // Atualiza o mapa para a nova localização
          map.setCenter(location);
          marker.setPosition(location);
          map.setZoom(10);
        } else {
          console.error("Geocode falhou: " + status);
        }
      }
    );
  } catch (error) {
    console.error("Erro ao atualizar o mapa:", error);
  }
}

// Inicia o carregamento de dados e criação de gráficos
fetchDataAndCreateCharts();
