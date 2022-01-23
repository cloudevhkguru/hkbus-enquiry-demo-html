//const apiHost = "https://lightsail.cloudev.guru/hkbus-enquiry-api"
const apiHost = "http://localhost:8080/hkbus-enquiry-api"
const titleEn = "Hong Kong Bus Enquiry"
const titleTc = "香港公共巴士查詢"
const titleSc = "香港公共巴士查询"

let sysLang = ""

function setLanguageEn() {
    for (let pageEnElement of document.getElementsByClassName("en_item")) {
        pageEnElement.style.display = ""
    }
    for (let pageTcElement of document.getElementsByClassName("tc_item")) {
        pageTcElement.style.display = "none"
    }
    for (let pageTcElement of document.getElementsByClassName("sc_item")) {
        pageTcElement.style.display = "none"
    }
    document.title = titleEn
    sysLang = "en"
}

function setLanguageTc() {
    for (let pageEnElement of document.getElementsByClassName("tc_item")) {
        pageEnElement.style.display = ""
    }
    for (let pageTcElement of document.getElementsByClassName("en_item")) {
        pageTcElement.style.display = "none"
    }
    for (let pageTcElement of document.getElementsByClassName("sc_item")) {
        pageTcElement.style.display = "none"
    }
    document.title = titleTc
    sysLang = "tc"
}

function setLanguageSc() {
    for (let pageEnElement of document.getElementsByClassName("sc_item")) {
        pageEnElement.style.display = ""
    }
    for (let pageTcElement of document.getElementsByClassName("en_item")) {
        pageTcElement.style.display = "none"
    }
    for (let pageTcElement of document.getElementsByClassName("tc_item")) {
        pageTcElement.style.display = "none"
    }
    document.title = titleSc
    sysLang = "sc"
}

function cleanRouteFound(){
    document.getElementById("routeFoundEn").innerHTML=""
    document.getElementById("routeFoundTc").innerHTML=""
    document.getElementById("routeFoundSc").innerHTML=""
}

function cleanTable() {
    document.getElementById("stopsEn").innerHTML = ""
    document.getElementById("stopsTc").innerHTML = ""
    document.getElementById("stopsSc").innerHTML = ""
    document.getElementById("warningEn").innerHTML = ""
    document.getElementById("warningTc").innerHTML = ""
    document.getElementById("warningSc").innerHTML = ""
    removeAllEtaList()
}

function removeAllEtaList() {
    for (let etaListEn of document.getElementsByClassName("etaListEn")) {
        etaListEn.remove()
    }
    for (let etaListTc of document.getElementsByClassName("etaListTc")) {
        etaListTc.remove()
    }
    for (let etaListSc of document.getElementsByClassName("etaListSc")) {
        etaListSc.remove()
    }
}

function getCompanyValue() {
    if (sysLang == "en") {
        return document.getElementById("companyEn").value;
    } else if (sysLang == "sc") {
        return document.getElementById("companySc").value;
    } else {
        return document.getElementById("companyTc").value;
    }
}

function getDirectionValue() {
    if (sysLang == "en") {
        return document.getElementById("directionEn").value;
    } else if (sysLang == "sc") {
        return document.getElementById("directionSc").value;
    } else {
        return document.getElementById("directionTc").value;
    }
}

function renderRouteListByRoute() {
    cleanRouteFound()
    cleanTable()
    let route = document.getElementById("routeSearch").value;
    document.getElementById("routeSearchBtn").disabled=true
    if (route != null && route != "") {
        getRouteListByRoute(route)
        document.getElementById("routeSearchBtn").disabled=false
    }else{
        document.getElementById("routeSearchBtn").disabled=false
    }
}

function showRoute(e) {
    cleanTable()
    let routeKey = document.getElementById(e.srcElement.id).value;
    let routeInfo = routeKey.split("-")
    let company = routeInfo[0]
    let route = routeInfo[1]
    let direction = routeInfo[2]
    let serviceType = routeInfo[3]
    if (route != null && route != "") {
        renderRouteDetail(company, route, direction, serviceType)
    }
}

async function getRouteListByRoute(route) {
    let url = `${apiHost}/route/${route.trim()}`
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        if (this.response) {
            responseJson = JSON.parse(this.response)
            renderRouteListOption(route,responseJson.result)
        }
    }
    xhttp.open("GET", url);
    xhttp.send();
}

function routeOnUiIsSameAsRequested(routeRequested) {
    let routeOnUi = document.getElementById("routeSearch").value;
    return routeOnUi == routeRequested
}

function renderRouteListOption(route,routeDtos) {
    if (routeDtos.length == 0) {
        cleanTable()
        document.getElementById("routeFoundEn").innerHTML = ""
        document.getElementById("routeFoundTc").innerHTML = ""
        document.getElementById("routeFoundSc").innerHTML = ""
        setnotFoundWarning(route)
        return
    }
    let routeDtosSorted = routeDtos.sort(function (a, b) {
        let x = a.route.toString().toLowerCase() + (a.serviceType == null ? "999" : a.serviceType.toString().toLowerCase()) + a.bound.toLowerCase();
        let y = b.route.toString().toLowerCase() + (b.serviceType == null ? "999" : b.serviceType.toString().toLowerCase()) + b.bound.toLowerCase();
        if (x < y) { return -1; }
        if (x > y) { return 1; }
        return 0;
    })
    let enHtml
    let tcHtml
    let scHtml
    for (let i = 0; i < routeDtosSorted.length; i++) {
        routeDto = routeDtosSorted[i]
        let routeKey = getRouteKey(routeDto.company, routeDto.route, routeDto.bound, routeDto.serviceType)
        enHtml += `<option value=${routeKey}>${routeDto.company} ${routeDto.route} ${routeDto.originEn} -> ${routeDto.destinationEn}</option>`
        tcHtml += `<option value=${routeKey}>${routeDto.company} ${routeDto.route} ${routeDto.originTc} -> ${routeDto.destinationTc}</option>`
        scHtml += `<option value=${routeKey}>${routeDto.company} ${routeDto.route} ${routeDto.originSc} -> ${routeDto.destinationSc}</option>`
        if (i == 0) {
            renderRouteDetail(routeDto.company, routeDto.route, routeDto.bound, routeDto.serviceType)
        }
    }
    document.getElementById("routeFoundEn").innerHTML = enHtml
    document.getElementById("routeFoundTc").innerHTML = tcHtml
    document.getElementById("routeFoundSc").innerHTML = scHtml
    if (routeDtos.length > 19) {
        setTooManyRouteWarning(routeDtos.length)
    }
}

async function renderRouteDetail(company, route, direction, serviceType) {
    removeAllEtaList()
    disabledRouteFindList(true)
    let url = `${apiHost}/route-detail/${company}/${route}/${direction}/${serviceType}`
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        if (this.response) {
            disabledRouteFindList(false)
            let routeDetailJson = JSON.parse(this.response)
            let result = routeDetailJson.result
            let stopDetailDtos = result.stopDetailDtos
            let stopDetailDtosSorted = stopDetailDtos.sort(function (a, b) { return a.seq - b.seq });
            let enListHtml = "";
            let tcListHtml = "";
            let scListHtml = "";
            for (let i = 0; i < stopDetailDtosSorted.length; i++) {
                let stopDto = stopDetailDtosSorted[i].stopDto
                let seq = stopDetailDtosSorted[i].seq
                enListHtml += `<li><a href="#" id="${stopDto.company}_${stopDto.stop}_${route}_${direction}_${serviceType}_${seq}_en" class="routeStop" onclick="showRouteStopEta(event)">${stopDto.nameEn}<a></li>`
                tcListHtml += `<li><a href="#" id="${stopDto.company}_${stopDto.stop}_${route}_${direction}_${serviceType}_${seq}_tc" class="routeStop" onclick="showRouteStopEta(event)">${stopDto.nameTc}<a></li>`
                scListHtml += `<li><a href="#" id="${stopDto.company}_${stopDto.stop}_${route}_${direction}_${serviceType}_${seq}_sc" class="routeStop" onclick="showRouteStopEta(event)">${stopDto.nameSc}<a></li>`
            }
            document.getElementById("stopsEn").innerHTML = enListHtml
            document.getElementById("stopsTc").innerHTML = tcListHtml
            document.getElementById("stopsSc").innerHTML = scListHtml
        }

    }
    xhttp.open("GET", url);
    xhttp.send();
}

async function disabledRouteFindList(disabled) {
    document.getElementById("routeFoundEn").disabled = disabled
    document.getElementById("routeFoundTc").disabled = disabled
    document.getElementById("routeFoundSc").disabled = disabled
}

function getRouteKey(company, route, direction, serviceType) {
    if (serviceType == null) {
        serviceType = 'null'
    }
    return `${company}-${route}-${direction}-${serviceType}`;
}

function showRouteStopEta(e) {
    removeAllEtaList()
    let routeStopId = e.srcElement.id
    let etaParameters = routeStopId.split("_")
    let company = etaParameters[0]
    let stopId = etaParameters[1]
    let route = etaParameters[2]
    let direction = etaParameters[3]
    let serviceType = etaParameters[4]
    let seq = etaParameters[5]
    renderRouteStopEta(company, stopId, route, direction, serviceType, seq)
}

async function renderRouteStopEta(company, stopId, route, direction, serviceType, seq) {
    removeAllEtaList()
    let routeStopIdEn = `${company}_${stopId}_${route}_${direction}_${serviceType}_${seq}_en`
    let routeStopIdTc = `${company}_${stopId}_${route}_${direction}_${serviceType}_${seq}_tc`
    let routeStopIdSc = `${company}_${stopId}_${route}_${direction}_${serviceType}_${seq}_sc`
    let url = `${apiHost}/route-stop-eta/${company}/${stopId}/${route}/${direction}/${serviceType}`
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        if (this.response) {
            let routeStopEtaDtos = JSON.parse(this.response).result
            let routeStopEtaDtosSorted = routeStopEtaDtos.sort(function (a, b) { return a.minutes - b.minutes })
            let routeStopEtaHtmlEn = `<div class="etaListEn"><ol>`
            let routeStopEtaHtmlTc = `<div class="etaListTc"><ol>`
            let routeStopEtaHtmlSc = `<div class="etaListSc"><ol>`
            for (let routeStopEta of routeStopEtaDtosSorted) {
                if (routeStopEta.minutes == null) {
                    continue;
                }
                let minutesWord = "minutes"
                if (routeStopEta.minutes < 2) {
                    minutesWord = "minute"
                }
                routeStopEtaHtmlEn += `<li>${routeStopEta.minutes}${minutesWord} ${routeStopEta.remarkEn}</li>`
                routeStopEtaHtmlTc += `<li>${routeStopEta.minutes}分鐘 ${routeStopEta.remarkTc}</li>`
                routeStopEtaHtmlSc += `<li>${routeStopEta.minutes}分钟 ${routeStopEta.remarkSc}</li>`
            }
            let checkTime = new Date()
            routeStopEtaHtmlEn += `</ol><p>${getUpdatedTimeEn(checkTime)}</p>`
            routeStopEtaHtmlTc += `</ol><p>${getUpdatedTimeTc(checkTime)}</p>`
            routeStopEtaHtmlSc += `</ol><p>${getUpdatedTimeSc(checkTime)}</p>`
            routeStopEtaHtmlEn += `<button href="#" id="${routeStopIdEn}_b" onclick="showRouteStopEta(event)">Refresh</button></div>`
            routeStopEtaHtmlTc += `<button href="#" id="${routeStopIdTc}_b" onclick="showRouteStopEta(event)">更新</button></div>`
            routeStopEtaHtmlSc += `<button href="#" id="${routeStopIdSc}_b" onclick="showRouteStopEta(event)">更新</button></div>`
            document.getElementById(routeStopIdEn).outerHTML += routeStopEtaHtmlEn
            document.getElementById(routeStopIdTc).outerHTML += routeStopEtaHtmlTc
            document.getElementById(routeStopIdSc).outerHTML += routeStopEtaHtmlSc
        }
    }
    xhttp.open("GET", url);
    xhttp.send();
}

function generateRefreshButton(routeStopId) {
    return `<a href="" onclick=>`
}

function getUpdatedTimeEn(checkTime) {
    let y = checkTime.getFullYear()
    let m = checkTime.getMonth() + 1
    let d = checkTime.getDate()
    let h = checkTime.getHours()
    let n = checkTime.getMinutes()
    let s = checkTime.getSeconds()
    return `Updated at ${y}-${m}-${d} ${h}:${n}:${s}`
}

function getUpdatedTimeTc(checkTime) {
    let y = checkTime.getFullYear()
    let m = checkTime.getMonth() + 1
    let d = checkTime.getDate()
    let h = checkTime.getHours()
    let n = checkTime.getMinutes()
    let s = checkTime.getSeconds()
    return `於${y}年${m}月${d}日${h}:${n}:${s}更新`
}

function getUpdatedTimeSc(checkTime) {
    let y = checkTime.getFullYear()
    let m = checkTime.getMonth() + 1
    let d = checkTime.getDate()
    let h = checkTime.getHours()
    let n = checkTime.getMinutes()
    let s = checkTime.getSeconds()
    return `于${y}年${m}月${d}日${h}:${n}:${s}更新`
}

async function setnotFoundWarning(route) {
    let enMsg = `Cannot find${route}!`
    let tcMsg = `未能找到路線 ${route}。`
    let scMsg = `未能找到路线${route}。`
    document.getElementById("warningEn").innerHTML = enMsg
    document.getElementById("warningTc").innerHTML = tcMsg
    document.getElementById("warningSc").innerHTML = scMsg
    if (sysLang == "tc") {
        window.alert(tcMsg)
    } else if (sysLang == "sc") {
        window.alert(scMsg)
    } else {
        window.alert(enMsg)
    }
}

async function setTooManyRouteWarning(count) {
    let enMsg = `${count} routes are found. Please specific the route!`
    let tcMsg = `找到${count}條路線，請提供更完整的路線編號。`
    let scMsg = `找到${count}条路线，请提供更完整的路线编号。`
    document.getElementById("warningEn").innerHTML = enMsg
    document.getElementById("warningTc").innerHTML = tcMsg
    document.getElementById("warningSc").innerHTML = scMsg
    if (sysLang == "tc") {
        window.alert(tcMsg)
    } else if (sysLang == "sc") {
        window.alert(scMsg)
    } else {
        window.alert(enMsg)
    }
}