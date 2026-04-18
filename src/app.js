(function(){
  const drop = document.getElementById('drop');
  const fileInput = document.getElementById('fileinput');
  const browse = document.getElementById('browse');
  const uploadBtn = document.getElementById('uploadBtn');

  browse && browse.addEventListener('click', ()=> fileInput && fileInput.click());

  function prevent(e){ e.preventDefault(); e.stopPropagation(); }
  ['dragenter','dragover','dragleave','drop'].forEach(ev=> drop && drop.addEventListener(ev, prevent));

  drop && drop.addEventListener('dragover', ()=> drop.classList.add('dragover'));
  drop && drop.addEventListener('dragleave', ()=> drop.classList.remove('dragover'));
  drop && drop.addEventListener('drop', (e)=>{
    drop.classList.remove('dragover');
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if(f) handleFile(f);
  });

  fileInput && fileInput.addEventListener('change', (e)=>{
    const f = e.target.files && e.target.files[0]; if(f) handleFile(f);
  });

  function handleFile(file){
    if(!file.type.startsWith('image/')){ alert('이미지 파일만 업로드 가능합니다.'); return }
    if(file.size > 25*1024*1024){ alert('파일 크기는 25MB 이하만 허용됩니다.'); return }
    // 간단한 미리보기: dropzone에 이미지 배경으로 표시
    const reader = new FileReader();
    reader.onload = ()=>{
      if(drop) drop.style.background = `url(${reader.result}) center/cover no-repeat`;
    };
    reader.readAsDataURL(file);
    // 원래는 여기서 업로드 API 호출
    console.log('Selected file:', file.name, file.size);
  }

  uploadBtn && uploadBtn.addEventListener('click', ()=>{
    alert('업로드 동작은 데모입니다. 서버 업로드 로직을 추가하세요.');
  });
})();
