;"use strict";

let Ajax = {
    get: function (url) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4) return;
                if (xhr.status === 200) resolve(xhr.responseText);
                else reject(xhr.status)
            };
            xhr.send();
        });
    },
    post: function (url, object) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4) return;
                if (xhr.status === 200) resolve(xhr.responseText);
                else reject(xhr.status)
            };
            let data = new FormData();
            for (let key in object) {
                data.append(key, object[key])
            }
            xhr.send(data);
        });
    }
};

let page = {
    init: function () {
        this.longitude = document.querySelector(".longitude");
        this.latitude = document.querySelector(".latitude");
        this.map = document.getElementById("map");
        this.pplList = document.querySelector(".ppl");
        this.curTime = document.querySelector(".curTime");
        this.curDate = document.querySelector(".curDate");
        this.total = document.querySelector(".total");
        this.initMap();
        this.getCoords();
        this.getPeopleFromIss();
        this.setUpdater(5);
    },

    setUpdater: function (sec) {
        let interval = setInterval(() => {
            this.getPeopleFromIss();
            this.getCoords();
        }, sec * 1000);
    },

    getCoords: function () {
        Ajax.get("http://api.open-notify.org/iss-now.json")
            .then(response => {
                let data = JSON.parse(response);
                if (data.message !== "success") throw new Error("Error connection");
                this.coords = {
                    "lat": parseFloat(data.iss_position.latitude),
                    "lng": parseFloat(data.iss_position.longitude)
                };
                this.redrawCoords();
                this.initTime(data.timestamp);
            }).catch((error) => console.log(error));
    },

    redrawCoords: function () {
        this.map.setCenter(this.coords);
        this.marker.setPosition(this.coords);

        this.longitude.innerText = "";
        this.latitude.innerText = "";

        this.latitude.innerText = this.coords.lat;
        this.longitude.innerText = this.coords.lng;
    },

    getPeopleFromIss: function () {
        Ajax.get("http://api.open-notify.org/astros.json")
            .then(response => {
                let data = JSON.parse(response);
                if (data.message !== "success") throw new Error("Error connection");
                this.people = data.people.filter((person) => person.craft === "ISS");
                this.amount = this.people.length;
                this.initPeopleList();
            }).catch((error) => console.log(error));
    },

    initPeopleList: function () {
        this.total.innerText = "";
        this.total.innerText = this.amount;

        this.pplList.innerHTML = "";
        let fragment = document.createDocumentFragment();
        this.people.forEach(person => fragment.appendChild(this.createPerson(person.name)));
        this.pplList.appendChild(fragment);
    },

    createPerson(name) {
        let person = document.createElement("DIV");
        let fullName = document.createElement("P");
        let img = document.createElement("DIV");

        person.classList.add("person");
        fullName.classList.add("name");
        img.classList.add("personImg");

        fullName.textContent = name;

        person.appendChild(img);
        person.appendChild(fullName);

        return person;
    },

    initMap: function () {
        this.map = new google.maps.Map(this.map, {
            zoom: 6,
            center: this.coords
        });
        this.marker = new google.maps.Marker({
            position: this.coords,
            map: this.map
        });
    },

    initTime: function (sec) {
        let time = new Date(sec * 1000);
        let minutes = time.getUTCMinutes() < 10 ? "0" + time.getUTCMinutes() : time.getUTCMinutes();
        let date = time.toUTCString().split(",")[0]
            + ", " + time.getUTCDate()
            + " " + time.toUTCString().split(" ")[2]
            + " " + time.getUTCFullYear();
        this.curTime.innerText = "";
        this.curTime.innerText = time.getUTCHours() + ":" + minutes;
        this.curDate.innerText = "";
        this.curDate.innerText = date;
    }
};

window.addEventListener("load", page.init.bind(page));
