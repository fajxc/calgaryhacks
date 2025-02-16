async function fetchJobs() {
  const jobContainer = document.getElementById("job-listings");
  const locationSelect = document.getElementById("location-select");
  const roleSearch = document.getElementById("role-search");

  const selectedLocation = locationSelect.value;
  const selectedRole = roleSearch.value.trim() || "Software Engineer"; // Ensure default role

  jobContainer.innerHTML = "<p>Loading job listings...</p>";

  try {
    const APP_ID = "313bb860"; // Replace with your Adzuna App ID
    const APP_KEY = "17d81ece71f4214851b34833d1b35514"; // Replace with your Adzuna App Key

    const response = await fetch(
      `https://api.adzuna.com/v1/api/jobs/ca/search/1?app_id=${APP_ID}&app_key=${APP_KEY}&results_per_page=20&what=${encodeURIComponent(selectedRole)}&where=${encodeURIComponent(selectedLocation)}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch job listings. Status: ${response.status}`);
    }

    const data = await response.json();
    jobContainer.innerHTML = "";

    if (data.results && data.results.length > 0) {
      data.results.forEach((job) => {
        const jobElement = document.createElement("div");
        jobElement.classList.add("job");
        jobElement.innerHTML = `
          <h2>${job.title}</h2>
          <p><strong>Company:</strong> ${job.company.display_name}</p>
          <p><strong>Location:</strong> ${job.location.display_name}</p>
          <p>${job.description.slice(0, 150)}...</p>
          <a href="${job.redirect_url}" target="_blank">View Job</a>
        `;
        jobContainer.appendChild(jobElement);
      });
    } else {
      jobContainer.innerHTML = "<p>No job listings found.</p>";
    }
  } catch (error) {
    console.error("Error fetching job listings:", error);
    jobContainer.innerHTML = `<p>Error loading job listings. Please try again later.</p><p>${error.message}</p>`;
  }
}

// Fetch jobs when the page loads
document.addEventListener("DOMContentLoaded", fetchJobs);

// Event listeners
document.getElementById("location-select").addEventListener("change", fetchJobs);
document.getElementById("role-search").addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    fetchJobs();
  }
});
