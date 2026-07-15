(function() {
  "use strict";

  var SVG_NS = "http://www.w3.org/2000/svg";
  var FOCUS_TOPIC = "AI4Economy";
  var SELF_AUTHOR = "Can Liu";
  var AUTHOR_VISUAL_CAP = 5;

  document.querySelectorAll("[data-publication-map]").forEach(function(map) {
    var topicList = map.querySelector("[data-topic-list]");
    var lineLayer = map.querySelector("[data-topic-lines]");
    var filterToggle = map.querySelector("[data-topic-filter-toggle]");
    var filterSummary = map.querySelector("[data-topic-filter-summary]");
    var filterMenu = map.querySelector("[data-topic-filter-menu]");
    var filterOptions = map.querySelector("[data-topic-filter-options]");
    var filterClear = map.querySelector("[data-topic-filter-clear]");
    var filterStatus = map.querySelector("[data-topic-filter-status]");
    var authorList = map.querySelector("[data-author-list]");
    var authorStatus = map.querySelector("[data-author-status]");
    var people = JSON.parse(authorList.getAttribute("data-author-links") || "{}");
    var publications = Array.prototype.slice.call(map.querySelectorAll(".publication"));
    var topicLabels = JSON.parse(topicList.getAttribute("data-topic-labels") || "{}");
    var isLocalized = Object.keys(topicLabels).length > 0;
    var topics = {};
    var allAuthorCounts = {};
    var selectedTopics = [];
    var activePublication = null;
    var drawFrame = null;

    publications.forEach(function(publication) {
      var data = JSON.parse(publication.getAttribute("data-pub") || "{}");
      publication.publicationTopics = data.topics || [];
      publication.publicationAuthors = data.authors || [];
      publication.publicationId = publication.querySelector("h3").id;
      publication.isPointerActive = false;
      publication.isFocusActive = false;

      publication.addEventListener("mouseenter", function() {
        publication.isPointerActive = true;
        updatePublicationInteraction(publication);
      });

      publication.addEventListener("mouseleave", function() {
        publication.isPointerActive = false;
        updatePublicationInteraction(publication);
      });

      publication.addEventListener("focusin", function() {
        publication.isFocusActive = true;
        updatePublicationInteraction(publication);
      });

      publication.addEventListener("focusout", function(event) {
        if (!publication.contains(event.relatedTarget)) {
          publication.isFocusActive = false;
          updatePublicationInteraction(publication);
        }
      });

      publication.publicationTopics.forEach(function(topic) {
        if (!topics[topic]) {
          topics[topic] = [];
        }
        topics[topic].push(publication);
      });

      publication.publicationAuthors.forEach(function(author) {
        if (!isSelfAuthor(author)) {
          allAuthorCounts[author] = (allAuthorCounts[author] || 0) + 1;
        }
      });
    });

    var topicEntries = Object.keys(topics).map(function(topic) {
      return { name: topic, publications: topics[topic] };
    }).sort(function(a, b) {
      if (a.name === FOCUS_TOPIC) {
        return -1;
      }
      if (b.name === FOCUS_TOPIC) {
        return 1;
      }
      return b.publications.length - a.publications.length || a.name.localeCompare(b.name);
    });

    if (!topicEntries.length) {
      map.hidden = true;
      return;
    }

    var topicCounts = topicEntries.map(function(entry) {
      return entry.publications.length;
    });
    var minCount = Math.min.apply(Math, topicCounts);
    var maxCount = Math.max.apply(Math, topicCounts);

    topicEntries.forEach(function(entry) {
      var button = document.createElement("button");
      var scale = maxCount === minCount ? 0.5 :
        (Math.sqrt(entry.publications.length) - Math.sqrt(minCount)) /
        (Math.sqrt(maxCount) - Math.sqrt(minCount));

      button.type = "button";
      button.className = "publication-topic";
      button.classList.toggle("is-focus-topic", entry.name === FOCUS_TOPIC);
      button.dataset.topic = entry.name;
      button.style.setProperty("--topic-opacity", (0.52 + scale * 0.48).toFixed(3));
      button.setAttribute("aria-pressed", "false");
      button.setAttribute("title", entry.publications.length + (isLocalized ? " 篇论文" : " publications"));
      var label = document.createElement("span");
      var count = document.createElement("small");
      label.textContent = topicLabels[entry.name] || entry.name;
      count.textContent = entry.publications.length;
      button.appendChild(label);
      button.appendChild(count);
      topicList.appendChild(button);
      entry.button = button;

      var option = document.createElement("label");
      var checkbox = document.createElement("input");
      var optionName = document.createElement("span");
      var optionCount = document.createElement("small");
      option.className = "publication-topic-filter-option";
      checkbox.type = "checkbox";
      checkbox.value = entry.name;
      checkbox.setAttribute("data-topic-filter-option", "");
      optionName.textContent = topicLabels[entry.name] || entry.name;
      optionCount.textContent = entry.publications.length;
      option.appendChild(checkbox);
      option.appendChild(optionName);
      option.appendChild(optionCount);
      filterOptions.appendChild(option);
      entry.checkbox = checkbox;

      button.addEventListener("mouseenter", function() {
        if (!selectedTopics.length) {
          setActiveTopics([entry.name]);
        }
      });

      button.addEventListener("mouseleave", function() {
        if (!selectedTopics.length) {
          setActiveTopics([]);
        }
      });

      button.addEventListener("focus", function() {
        if (!selectedTopics.length) {
          setActiveTopics([entry.name]);
        }
      });

      button.addEventListener("blur", function() {
        if (!selectedTopics.length) {
          setActiveTopics([]);
        }
      });

      button.addEventListener("click", function() {
        toggleTopic(entry.name);
      });

      checkbox.addEventListener("change", function() {
        toggleTopic(entry.name, checkbox.checked);
      });
    });

    map.querySelectorAll("[data-publication-topic]").forEach(function(chip) {
      chip.addEventListener("click", function() {
        var topic = chip.getAttribute("data-publication-topic");
        toggleTopic(topic);
      });
    });

    filterToggle.addEventListener("click", function() {
      setMenuOpen(filterMenu.hidden);
    });

    filterClear.addEventListener("click", function() {
      applyFilters([]);
      filterToggle.focus();
    });

    document.addEventListener("click", function(event) {
      if (!map.querySelector(".publication-topic-filter").contains(event.target)) {
        setMenuOpen(false);
      }
    });

    function toggleTopic(topic, forceSelected) {
      var isSelected = selectedTopics.indexOf(topic) !== -1;
      var shouldSelect = typeof forceSelected === "boolean" ? forceSelected : !isSelected;
      var nextTopics = selectedTopics.filter(function(selectedTopic) {
        return selectedTopic !== topic;
      });

      if (shouldSelect) {
        nextTopics.push(topic);
      }
      applyFilters(nextTopics);
    }

    function applyFilters(nextTopics) {
      selectedTopics = topicEntries.map(function(entry) {
        return entry.name;
      }).filter(function(topic) {
        return nextTopics.indexOf(topic) !== -1;
      });

      topicEntries.forEach(function(entry) {
        entry.checkbox.checked = selectedTopics.indexOf(entry.name) !== -1;
      });

      var visibleCount = 0;
      publications.forEach(function(publication) {
        var isVisible = !selectedTopics.length || selectedTopics.some(function(topic) {
          return publication.publicationTopics.indexOf(topic) !== -1;
        });
        publication.classList.toggle("is-filtered-out", !isVisible);
        if (isVisible) {
          visibleCount += 1;
        }
      });

      map.querySelectorAll(".publication-year-section").forEach(function(section) {
        var hasVisiblePublication = Array.prototype.some.call(
          section.querySelectorAll(".publication"),
          function(publication) {
            return !publication.classList.contains("is-filtered-out");
          }
        );
        section.classList.toggle("is-filtered-out", !hasVisiblePublication);
      });

      filterStatus.textContent = visibleCount + " / " + publications.length;
      if (!selectedTopics.length) {
        filterSummary.textContent = filterToggle.getAttribute("data-all-topics-label");
      } else if (selectedTopics.length === 1) {
        filterSummary.textContent = topicLabels[selectedTopics[0]] || selectedTopics[0];
      } else {
        filterSummary.textContent = isLocalized ? "已选 " + selectedTopics.length + " 项" : selectedTopics.length + " topics";
      }
      filterClear.disabled = !selectedTopics.length;
      map.classList.toggle("has-topic-filter", selectedTopics.length > 0);
      setActiveTopics(selectedTopics);
      scheduleDraw();
    }

    function setActiveTopics(activeTopics) {
      map.classList.toggle("has-active-topic", activeTopics.length > 0);

      map.querySelectorAll(".publication-topic").forEach(function(button) {
        var isActive = activeTopics.indexOf(button.dataset.topic) !== -1;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      publications.forEach(function(publication) {
        var isConnected = !activeTopics.length || activeTopics.some(function(topic) {
          return publication.publicationTopics.indexOf(topic) !== -1;
        });
        publication.classList.toggle("is-topic-match", activeTopics.length > 0 && isConnected);
        publication.classList.toggle("is-topic-muted", activeTopics.length > 0 && !isConnected);
      });

      map.querySelectorAll(".publication-topic-chip").forEach(function(chip) {
        chip.classList.toggle("is-active", activeTopics.indexOf(chip.getAttribute("data-publication-topic")) !== -1);
      });

      lineLayer.querySelectorAll("[data-topic]").forEach(function(mark) {
        var isActive = activeTopics.indexOf(mark.dataset.topic) !== -1;
        mark.classList.toggle("is-active", isActive);
        mark.classList.toggle("is-muted", activeTopics.length > 0 && !isActive);
      });
    }

    function updatePublicationInteraction(publication) {
      if (publication.isPointerActive || publication.isFocusActive) {
        setActivePublication(publication);
      } else if (activePublication === publication) {
        setActivePublication(null);
      }
    }

    function setActivePublication(publication) {
      activePublication = publication;
      var activeTopics = publication ? publication.publicationTopics : [];
      var activeAuthors = publication ? publication.publicationAuthors.filter(function(author) {
        return !isSelfAuthor(author);
      }) : [];
      var publicationId = publication ? publication.publicationId : "";

      map.classList.toggle("has-active-publication", Boolean(publication));

      publications.forEach(function(candidate) {
        candidate.classList.toggle("is-publication-active", candidate === publication);
      });

      map.querySelectorAll(".publication-topic").forEach(function(button) {
        button.classList.toggle("is-publication-connected", activeTopics.indexOf(button.dataset.topic) !== -1);
      });

      map.querySelectorAll(".publication-author").forEach(function(author) {
        author.classList.toggle("is-publication-connected", activeAuthors.indexOf(author.dataset.author) !== -1);
      });

      lineLayer.querySelectorAll("path, circle").forEach(function(mark) {
        var isConnected = false;
        if (publication) {
          if (mark.dataset.publication) {
            isConnected = mark.dataset.publication === publicationId;
          } else if (mark.dataset.topic) {
            isConnected = activeTopics.indexOf(mark.dataset.topic) !== -1;
          } else if (mark.dataset.author) {
            isConnected = activeAuthors.indexOf(mark.dataset.author) !== -1;
          }
        }
        mark.classList.toggle("is-publication-active", Boolean(publication) && isConnected);
        mark.classList.toggle("is-publication-muted", Boolean(publication) && !isConnected);
      });
    }

    function setMenuOpen(isOpen) {
      filterMenu.hidden = !isOpen;
      filterToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      map.classList.toggle("is-topic-menu-open", isOpen);
    }

    function drawLines() {
      lineLayer.innerHTML = "";

      if (window.matchMedia("(max-width: 800px)").matches) {
        authorList.innerHTML = "";
        authorStatus.textContent = "";
        return;
      }

      var mapRect = map.getBoundingClientRect();
      // Geometry below is measured in viewport CSS pixels. Keep the SVG
      // coordinate system in those same units so overflowing sidebars do not
      // scale the endpoints away from their labels.
      var width = Math.ceil(mapRect.width);
      var height = Math.ceil(mapRect.height);
      var visiblePublications = getVisiblePublications();
      var showAuthorRelations = !window.matchMedia("(max-width: 1100px)").matches;
      var authorElements = showAuthorRelations ? renderAuthors(visiblePublications) : {};

      if (!showAuthorRelations) {
        authorList.innerHTML = "";
        authorStatus.textContent = "";
      }

      lineLayer.setAttribute("viewBox", "0 0 " + width + " " + height);
      lineLayer.setAttribute("width", width);
      lineLayer.setAttribute("height", height);

      var pathFragment = document.createDocumentFragment();
      var endpointFragment = document.createDocumentFragment();

      topicEntries.forEach(function(entry) {
        var topicButton = entry.button;
        if (!topicButton) {
          return;
        }

        var sourceRect = topicButton.getBoundingClientRect();
        var x1 = sourceRect.right - mapRect.left + 6;
        var y1 = sourceRect.top - mapRect.top + sourceRect.height / 2;
        var hasVisibleConnection = false;

        entry.publications.forEach(function(publication) {
          if (publication.offsetParent === null) {
            return;
          }

          var targetRect = publication.getBoundingClientRect();
          if (targetRect.bottom < 0 || targetRect.top > window.innerHeight) {
            return;
          }

          var x2 = targetRect.left - mapRect.left - 6;
          var topicIndex = publication.publicationTopics.indexOf(entry.name);
          var topicOffset = (topicIndex - (publication.publicationTopics.length - 1) / 2) * 7;
          var y2 = targetRect.top - mapRect.top + Math.min(targetRect.height / 2, 48) + topicOffset;
          var bend = Math.max(34, Math.min(150, (x2 - x1) * 0.48));
          var path = document.createElementNS(SVG_NS, "path");
          var targetEndpoint = createEndpoint(x2, y2, entry.name, "target", publication.publicationId);

          hasVisibleConnection = true;
          path.dataset.topic = entry.name;
          path.dataset.publication = publication.querySelector("h3").id;
          path.setAttribute("d", [
            "M", x1.toFixed(1), y1.toFixed(1),
            "C", (x1 + bend).toFixed(1), y1.toFixed(1),
            (x2 - bend).toFixed(1), y2.toFixed(1),
            x2.toFixed(1), y2.toFixed(1)
          ].join(" "));
          pathFragment.appendChild(path);
          endpointFragment.appendChild(targetEndpoint);
        });

        if (hasVisibleConnection) {
          endpointFragment.appendChild(createEndpoint(x1, y1, entry.name, "source"));
        }
      });

      if (showAuthorRelations) {
        drawAuthorConnections(visiblePublications, authorElements, mapRect, pathFragment, endpointFragment);
      }

      lineLayer.appendChild(pathFragment);
      lineLayer.appendChild(endpointFragment);

      setActiveTopics(selectedTopics);
      setActivePublication(activePublication);
    }

    function getVisiblePublications() {
      return publications.filter(function(publication) {
        if (publication.classList.contains("is-filtered-out") || publication.offsetParent === null) {
          return false;
        }
        var rect = publication.getBoundingClientRect();
        return rect.bottom > 0 && rect.top < window.innerHeight;
      });
    }

    function renderAuthors(visiblePublications) {
      var visibleAuthorNames = [];
      var seenAuthors = {};
      var authorElements = {};

      // Publications are already rendered newest-first. Preserve that paper
      // order, then rank collaborators first appearing in the same paper by
      // their total count. This keeps crossings low without losing emphasis.
      visiblePublications.forEach(function(publication) {
        var newAuthors = publication.publicationAuthors.filter(function(author) {
          return !isSelfAuthor(author) && !seenAuthors[author];
        }).map(function(author, index) {
          return { name: author, index: index };
        }).sort(function(a, b) {
          return (allAuthorCounts[b.name] || 0) - (allAuthorCounts[a.name] || 0) || a.index - b.index;
        });

        newAuthors.forEach(function(entry) {
          var author = entry.name;
          seenAuthors[author] = true;
          visibleAuthorNames.push(author);
        });
      });

      var authorEntries = visibleAuthorNames.map(function(author) {
        return { name: author, count: allAuthorCounts[author] || 0 };
      });
      authorList.innerHTML = "";
      authorEntries.forEach(function(entry) {
        var author = document.createElement("span");
        var person = people[entry.name] || {};
        var authorName = document.createElement(person.url ? "a" : "span");
        var authorCount = document.createElement("small");
        var strength = Math.min(entry.count, AUTHOR_VISUAL_CAP) / AUTHOR_VISUAL_CAP;
        var size = 0.68 + Math.sqrt(strength) * 0.22;
        author.className = "publication-author";
        author.dataset.author = entry.name;
        authorName.textContent = entry.name;
        if (person.url) {
          authorName.href = person.url;
          authorName.target = "_blank";
          authorName.rel = "noopener noreferrer";
        }
        authorCount.textContent = entry.count;
        author.style.setProperty("--author-opacity", (0.5 + strength * 0.5).toFixed(3));
        author.style.setProperty("--author-size", size.toFixed(3) + "rem");
        author.setAttribute("title", entry.count + (isLocalized ? " 篇论文（总数）" : " publications in total"));
        author.appendChild(authorName);
        author.appendChild(authorCount);
        authorList.appendChild(author);
        authorElements[entry.name] = author;
      });

      var hint = authorStatus.getAttribute("data-author-hint") || "";
      authorStatus.textContent = visiblePublications.length ?
        visiblePublications.length + " / " + publications.length + " · " + hint : hint;
      return authorElements;
    }

    function drawAuthorConnections(visiblePublications, authorElements, mapRect, pathFragment, endpointFragment) {
      var drawnAuthorEndpoints = {};

      visiblePublications.forEach(function(publication) {
        var publicationRect = publication.getBoundingClientRect();
        var x1 = publicationRect.right - mapRect.left + 6;

        publication.publicationAuthors.forEach(function(author, index) {
          if (isSelfAuthor(author)) {
            return;
          }
          var authorElement = authorElements[author];
          if (!authorElement) {
            return;
          }

          var authorRect = authorElement.getBoundingClientRect();
          var authorOffset = (index - (publication.publicationAuthors.length - 1) / 2) * 4;
          var y1 = publicationRect.top - mapRect.top + Math.min(publicationRect.height / 2, 48) + authorOffset;
          var x2 = authorRect.left - mapRect.left - 6;
          var y2 = authorRect.top - mapRect.top + authorRect.height / 2;
          var bend = Math.max(34, Math.min(140, (x2 - x1) * 0.46));
          var path = document.createElementNS(SVG_NS, "path");

          path.classList.add("publication-author-line");
          path.dataset.author = author;
          path.dataset.publication = publication.publicationId;
          path.setAttribute("d", [
            "M", x1.toFixed(1), y1.toFixed(1),
            "C", (x1 + bend).toFixed(1), y1.toFixed(1),
            (x2 - bend).toFixed(1), y2.toFixed(1),
            x2.toFixed(1), y2.toFixed(1)
          ].join(" "));
          pathFragment.appendChild(path);
          endpointFragment.appendChild(createAuthorEndpoint(x1, y1, author, "source", publication.publicationId));

          if (!drawnAuthorEndpoints[author]) {
            endpointFragment.appendChild(createAuthorEndpoint(x2, y2, author, "target"));
            drawnAuthorEndpoints[author] = true;
          }
        });
      });
    }

    function isSelfAuthor(author) {
      return String(author || "").trim().toLowerCase() === SELF_AUTHOR.toLowerCase();
    }

    function createEndpoint(x, y, topic, type, publicationId) {
      var endpoint = document.createElementNS(SVG_NS, "circle");
      endpoint.classList.add("publication-map-endpoint", "is-" + type);
      endpoint.dataset.topic = topic;
      if (publicationId) {
        endpoint.dataset.publication = publicationId;
      }
      endpoint.setAttribute("cx", x.toFixed(1));
      endpoint.setAttribute("cy", y.toFixed(1));
      endpoint.setAttribute("r", type === "source" ? "3.4" : "3.1");
      return endpoint;
    }

    function createAuthorEndpoint(x, y, author, type, publicationId) {
      var endpoint = document.createElementNS(SVG_NS, "circle");
      endpoint.classList.add("publication-map-endpoint", "publication-author-endpoint", "is-" + type);
      endpoint.dataset.author = author;
      if (publicationId) {
        endpoint.dataset.publication = publicationId;
      }
      endpoint.setAttribute("cx", x.toFixed(1));
      endpoint.setAttribute("cy", y.toFixed(1));
      endpoint.setAttribute("r", type === "target" ? "3.4" : "2.8");
      return endpoint;
    }

    function scheduleDraw() {
      if (drawFrame !== null) {
        return;
      }
      drawFrame = window.requestAnimationFrame(function() {
        drawFrame = null;
        drawLines();
      });
    }

    document.addEventListener("keydown", function(event) {
      if (event.key === "Escape" && !filterMenu.hidden) {
        setMenuOpen(false);
        filterToggle.focus();
      } else if (event.key === "Escape" && selectedTopics.length) {
        applyFilters([]);
      }
    });

    window.addEventListener("resize", scheduleDraw);
    window.addEventListener("scroll", scheduleDraw, { passive: true });
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

    applyFilters([]);
  });
})();
