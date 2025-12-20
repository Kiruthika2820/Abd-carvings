const reviewForm = document.getElementById('reviewForm');
reviewForm.addEventListener('submit', function(e){
  e.preventDefault();
  const username = document.getElementById('username').value;
  const reviewText = document.getElementById('reviewText').value;

  fetch("/submit_review/{{ product.id }}", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, review: reviewText })
  })
  .then(res => res.json())
  .then(data => {
    const statusDiv = document.getElementById('reviewStatus');
    if(data.status === "ok"){
      statusDiv.innerText = "✅ Review submitted!";
      reviewForm.reset();
      setTimeout(closeAll, 1500);
    } else {
      statusDiv.innerText = "❌ Failed to submit review";
    }
  });
});
function loadAllReviews(){
  const data = JSON.parse(localStorage.getItem("allReviews")||"[]");
  const box=document.getElementById("reviews-container");
  if(!box) return;

  box.innerHTML = data.length
    ? data.map(r=>`
      <div class="review-card">
        <h4>${r.product}</h4>
        <p>${r.comment}</p>
      </div>`).join("")
    : "<p>No reviews yet</p>";
}

document.addEventListener("DOMContentLoaded",loadAllReviews);
