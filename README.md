<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <title>Rastreamento de Resíduos Hospitalares</title>
</head>
<body>

<h1>Sistema de Rastreamento</h1>

<p>Digite o código do resíduo:</p>

<input type="text" id="codigo" placeholder="Ex: 123">

<button onclick="buscar()">Buscar</button>

<p id="resultado"></p>

<script>
function buscar() {
  let codigo = document.getElementById("codigo").value;
  let resultado = document.getElementById("resultado");

  if(codigo == "123") {
    resultado.innerHTML = "Localização: Sala de cirurgia";
  } else if(codigo == "456") {
    resultado.innerHTML = "Localização: Laboratório";
  } else {
    resultado.innerHTML = "Código não encontrado";
  }
}
</script>

</body>
</html>
