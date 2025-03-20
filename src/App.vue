<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  padding: 0;
  color: #333;
  background-color: #f5f5f5;
}

#app {
  width: 100%;
  height: 100vh;
}

h1, h2, h3 {
  color: #2c3e50;
}

button {
  cursor: pointer;
  transition: background-color 0.3s;
}
</style>
