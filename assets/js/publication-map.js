(function() {
  "use strict";

  var SVG_NS = "http://www.w3.org/2000/svg";

  document.querySelectorAll("[data-publication-map]").forEach(function(map) {
    var topicList = map.querySelector("[data-topic-list]");
    var lineLayer = map.querySelector("[data-topic-lines]");
    var publications = Array.prototype.slice.call(map.querySelectorAll(".publication"));
    var topics = {};
    var pinnedTopic = null;
    var resizeTimer = null;

    publications.forEach(function(publication) {
      var data = JSON.parse(publication.getAttribute("data-pub") || "{}");
      publication.publicationTopics = data.topics || [];

      publication.publicationTopics.forEach(function(topic) {
        if (!topics[topic]) {
          topics[topic] = [];
        }
        topics[topic].push(publication);
      });
    });

    var topicEntries = Object.keys(topics).map(function(topic) {
      return { name: topic, publications: topics[topic] };
    }).sort(function(a, b) {
      return b.publications.length - a.publications.length || a.name.localeCompare(b.name);
    });

    if (!topicEntries.length) {
      map.hidden = true;
      return;
    }

    var minCount = topicEntries[topicEntries.length - 1].publications.length;
    var maxCount = topicEntries[0].publications.length;

    topicEntries.forEach(function(entry) {
      var button = document.createElement("button");
      var scale = maxCount === minCount ? 0.5 :
        (Math.sqrt(entry.publications.length) - Math.sqrt(minCount)) /
        (Math.sqrt(maxCount) - Math.sqrt(minCount));

      button.type = "button";
      button.className = "publication-topic";
      button.dataset.topic = entry.name;
      button.style.setProperty("--topic-scale", scale.toFixed(3));
      button.style.setProperty("--topic-size", (0.76 + scale * 0.54).toFixed(3) + "rem");
      button.style.setProperty("--topic-size-mobile", (0.72 + scale * 0.28).toFixed(3) + "rem");
      button.style.setProperty("--topic-weight", String(Math.round(420 + scale * 180)));
      button.style.setProperty("--topic-opacity", (0.52 + scale * 0.48).toFixed(3));
      button.setAttribute("aria-pressed", "false");
      button.setAttribute("title", entry.publications.length + " publications");
      var label = document.createElement("span");
      var count = document.createElement("small");
      label.textContent = entry.name;
      count.textContent = entry.publications.length;
      button.appendChild(label);
      button.appendChild(count);
      topicList.appendChild(button);
      entry.button = button;

      button.addEventListener("mouseenter", function() {
        if (!pinnedTopic) {
          setActiveTopic(entry.name);
        }
      });

      button.addEventListener("mouseleave", function() {
        if (!pinnedTopic) {
          setActiveTopic(null);
        }
      });

      button.addEventListener("focus", function() {
        if (!pinnedTopic) {
          setActiveTopic(entry.name);
        }
      });

      button.addEventListener("blur", function() {
        if (!pinnedTopic) {
          setActiveTopic(null);
        }
      });

      button.addEventListener("click", function() {
        pinnedTopic = pinnedTopic === entry.name ? null : entry.name;
        setActiveTopic(pinnedTopic);
      });
    });

    map.querySelectorAll("[data-publication-topic]").forEach(function(chip) {
      chip.addEventListener("click", function() {
        var topic = chip.getAttribute("data-publication-topic");
        pinnedTopic = pinnedTopic === topic ? null : topic;
        setActiveTopic(pinnedTopic);
      });
    });

    function setActiveTopic(topic) {
      map.classList.toggle("has-active-topic", !!topic);

      map.querySelectorAll(".publication-topic").forEach(function(button) {
        var isActive = button.dataset.topic === topic;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      publications.forEach(function(publication) {
        var isConnected = !topic || publication.publicationTopics.indexOf(topic) !== -1;
        publication.classList.toggle("is-topic-match", !!topic && isConnected);
        publication.classList.toggle("is-topic-muted", !!topic && !isConnected);
      });

      map.querySelectorAll(".publication-topic-chip").forEach(function(chip) {
        chip.classList.toggle("is-active", chip.getAttribute("data-publication-topic") === topic);
      });

      lineLayer.querySelectorAll("path").forEach(function(path) {
        path.classList.toggle("is-active", path.dataset.topic === topic);
        path.classList.toggle("is-muted", !!topic && path.dataset.topic !== topic);
      });
    }

    function drawLines() {
      lineLayer.innerHTML = "";

      if (window.matchMedia("(max-width: 800px)").matches) {
        return;
      }

      var mapRect = map.getBoundingClientRect();
      var width = Math.ceil(map.scrollWidth);
      var height = Math.ceil(map.scrollHeight);

      lineLayer.setAttribute("viewBox", "0 0 " + width + " " + height);
      lineLayer.setAttribute("width", width);
      lineLayer.setAttribute("height", height);

      topicEntries.forEach(function(entry) {
        var topicButton = entry.button;
        if (!topicButton) {
          return;
        }

        var sourceRect = topicButton.getBoundingClientRect();
        var x1 = sourceRect.right - mapRect.left + 8;
        var y1 = sourceRect.top - mapRect.top + sourceRect.height / 2;

        entry.publications.forEach(function(publication) {
          if (publication.offsetParent === null) {
            return;
          }

          var targetRect = publication.getBoundingClientRect();
          var x2 = targetRect.left - mapRect.left - 8;
          var y2 = targetRect.top - mapRect.top + Math.min(targetRect.height / 2, 48);
          var bend = Math.max(34, Math.min(150, (x2 - x1) * 0.48));
          var path = document.createElementNS(SVG_NS, "path");

          path.dataset.topic = entry.name;
          path.dataset.publication = publication.querySelector("h3").id;
          path.setAttribute("d", [
            "M", x1.toFixed(1), y1.toFixed(1),
            "C", (x1 + bend).toFixed(1), y1.toFixed(1),
            (x2 - bend).toFixed(1), y2.toFixed(1),
            x2.toFixed(1), y2.toFixed(1)
          ].join(" "));
          lineLayer.appendChild(path);
        });
      });

      setActiveTopic(pinnedTopic);
    }

    function scheduleDraw() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(drawLines, 80);
    }

    document.addEventListener("keydown", function(event) {
      if (event.key === "Escape" && pinnedTopic) {
        pinnedTopic = null;
        setActiveTopic(null);
      }
    });

    window.addEventListener("resize", scheduleDraw);
    window.addEventListener("load", drawLines);
    map.querySelectorAll("img").forEach(function(image) {
      if (!image.complete) {
        image.addEventListener("load", scheduleDraw, { once: true });
      }
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(drawLines);
    }

    if (window.ResizeObserver) {
      new ResizeObserver(scheduleDraw).observe(map.querySelector(".publication-timeline"));
    }

    drawLines();
  });
})();
