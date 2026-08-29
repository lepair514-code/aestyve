(function(){
  fetch('/content.json', {cache:'no-store'}).then(function(r){ return r.json(); }).then(function(data){
    document.querySelectorAll('[data-cms]').forEach(function(el){
      var item = data[el.getAttribute('data-cms')];
      if(!item) return;
      if(item.type === 'rich'){
        el.innerHTML = item.value;
      } else {
        el.textContent = item.value;
      }
    });
  }).catch(function(){ /* content.json 로드 실패 시 기본 텍스트 유지 */ });
})();
