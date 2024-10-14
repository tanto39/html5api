const fileInput = document.querySelector("#file-input");
const gallery = document.querySelector("#gallery");
const modal = document.querySelector("#modal");
const modalImg = document.querySelector("#modal-img");
const closeBtn = document.querySelector(".close");

fileInput.addEventListener("change", function () {
  const files = fileInput.files;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();

      reader.onload = function (e) {
        const img = document.createElement("img");
        img.src = e.target.result;
        img.className = "thumbnail";
        gallery.appendChild(img);

        img.addEventListener("click", function () {
          modal.style.display = "block";
          modalImg.src = e.target.result;
        });
      };

      reader.readAsDataURL(file);
    } else {
      alert("Файл не является изображением: " + file.name);
    }
  }
});

closeBtn.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target === modal) {
    modal.style.display = "none";
  }
};
