window.onload = function () {
    // API로 clientId 가져오기
    fetch('/api/client-id')
        .then(response => response.json())
        .then(data => {
            // 네이버 지도 API 동적 로드
            const script = document.createElement('script')
            script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${data.clientId}`
            script.onload = function () {
                initMap()
            }
            document.body.appendChild(script)
        })
        .catch(error => console.error('Error fetching client ID:', error))

    // 엔터 키 입력 시 검색 실행
    document.getElementById('search-input').addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            searchPlaces()
        }
    })

    // API가 로드된 후에만 검색 버튼 활성화
    document.querySelector("button").disabled = false
}

const mapConfig = {
    map: null,
    markers: [],
    infoWindows: [],
    activeInfoWindow: null
}

function initMap() {
    // 현위치 가져오기
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async function (position) {
                let lat = position.coords.latitude  // 위도
                let lng = position.coords.longitude // 경도
                let currentLocation = new naver.maps.LatLng(lat, lng)

                // 지도 객체 생성 (현위치를 중심으로)
                mapConfig.map = new naver.maps.Map('map', {
                    center: currentLocation,
                    zoom: 15
                })

                // 지도 클릭 시 모든 InfoWindow 닫기
                naver.maps.Event.addListener(mapConfig.map, "click", function () {
                    if (mapConfig.activeInfoWindow) {
                        mapConfig.activeInfoWindow.close()
                        mapConfig.activeInfoWindow = null
                    }
                })

                // 현재 위치에 마커 추가
                let marker = new naver.maps.Marker({
                    position: currentLocation,
                    map: mapConfig.map,
                    title: "현재 위치"
                })

                // 현재 위치 주변 검색
                try {
                    const response = await fetch(`/api/maps/nearby?lat=${lat}&lng=${lng}`)
                    const places = await response.json()
                    console.log(places) // API로부터 받은 데이터 출력
                    places.forEach(place => addPlaceMarker(place))
                } catch (error) {
                    console.error("음식점 정보를 불러오지 못했습니다.", error)
                }
            },
            function (error) {
                console.error("위치 정보를 가져올 수 없습니다: ", error)

                // 위치 정보를 가져오지 못한 경우, 기본 위치(서울)로 설정
                mapConfig.map = new naver.maps.Map('map', {
                    center: new naver.maps.LatLng(37.5665, 126.9780),
                    zoom: 15
                })
            }
        )
    } else {
        alert("위치 정보를 지원하지 않는 브라우저입니다.")
    }
}

// InfoWindow HTML
function infoWindowContent(place) {
    return `
        <div class="custom-infowindow">
            <button onclick="closeInfoWindow()">❌</button>
            <strong style="font-size: 18px; color: #333;">${place.name || place.title}</strong><br>
            <a href="${place.link || '#'}" target="_blank" style="color: #007aff;">🔗 홈페이지 방문</a>
            <hr>
            <p>📌 카테고리: ${place.category || '정보 없음'}</p>
            <p>🏢 주소: ${place.address}</p>
            <p>🛣️ 도로명 주소: ${place.roadAddress || '정보 없음'}</p>
            <p>📞 전화번호: ${place.telephone || '전화번호 없음'}</p>
            <p>ℹ️ 설명: ${place.description || '설명 없음'}</p>
        </div>`;
}

// 음식점 마커 추가
async function addPlaceMarker(place) {
    const lat = place.lat / 1e7
    const lng = place.lng / 1e7
    const position = new naver.maps.LatLng(lat, lng)
    const marker = new naver.maps.Marker({
        position: position,
        map: mapConfig.map,
        title: place.name
    })

     // 추가 정보 가져오기
     let addData = {}
     try {
         const response = await fetch(`/api/maps/search?query=${encodeURIComponent(place.name)}`)
         const searchData = await response.json()
 
         if (searchData.length > 0) {
            addData = searchData[0] // 첫 번째 검색 결과 사용
         }
     } catch (error) {
         console.error("추가 정보 가져오기 실패:", error)
     }

     const infoWindow = new naver.maps.InfoWindow({
        content: infoWindowContent({ ...place, ...addData }),
        disableAutoPan: false,
        borderWidth: 0,
        backgroundColor: "rgba(0,0,0,0)"
    })

    naver.maps.Event.addListener(marker, "click", function () {
        if (mapConfig.activeInfoWindow) {
            mapConfig.activeInfoWindow.close()
        }
        infoWindow.open(mapConfig.map, marker)
        mapConfig.activeInfoWindow = infoWindow
    })

    mapConfig.markers.push(marker)
    mapConfig.infoWindows.push(infoWindow)
}

// 장소 검색
async function searchPlaces() {
    const query = document.getElementById('search-input').value.trim()
    if (!query) {
        alert('검색어를 입력하세요.')
        return
    }
    if (!mapConfig.map) {
        alert("지도가 아직 로드되지 않았습니다. 잠시 후 다시 시도하세요.")
        return
    }

    try {
        const response = await fetch(`/api/maps/search?query=${query}`)
        const places = await response.json()

        if (places.error){
            alert(places.message)
            return
        }

        if (!Array.isArray(places) || places.length === 0) {
            alert('검색 결과가 없습니다.')
            return 
        }

        // 기존 마커 삭제
        clearMarkers()

        // 위치 정보가 없는 경우 해당 장소를 추가하지 않음
        for (const place of places) {
            if (!place.mapx || !place.mapy) continue

            // 값을 string으로 나눠주기 때문에 숫자로 변환 후 계산 진행
            const lat = parseFloat(place.mapy) / 1e7
            const lng = parseFloat(place.mapx) / 1e7

            const marker = new naver.maps.Marker({ // 마커 생성
                position: new naver.maps.LatLng(lat, lng), // position으로 마커 위치 지정
                map: mapConfig.map // 마커를 어디에 표시할지
            })

            const infoWindow = new naver.maps.InfoWindow({
                content: infoWindowContent(place),
                disableAutoPan: false,
                borderWidth: 0,
                backgroundColor: "rgba(0,0,0,0)"
            })

            // 마커 클릭 시 정보창 표시
            naver.maps.Event.addListener(marker, "click", function () {
                if (mapConfig.activeInfoWindow) mapConfig.activeInfoWindow.close()
                infoWindow.open(mapConfig.map, marker)
                mapConfig.activeInfoWindow = infoWindow
            })

            // 검색 결과를 마커, 정보창에 추가
            mapConfig.markers.push(marker)
            mapConfig.infoWindows.push(infoWindow)
        }

        // 검색 결과 중 첫 번째 장소로 지도 이동
        mapConfig.map.setCenter(new naver.maps.LatLng(places[0].mapy / 1e7, places[0].mapx / 1e7))
        mapConfig.map.setZoom(16)
    } catch (error) {
        console.error("검색 요청 실패:", error)
    }
}

// 마커 초기화
function clearMarkers() {
    mapConfig.markers.forEach(marker => marker.setMap(null))
    mapConfig.infoWindows.forEach(infoWindow => infoWindow.setMap(null))
    mapConfig.markers = []
    mapConfig.infoWindows = []
}

// 닫기 버튼 클릭 시 InfoWindow 닫기
window.closeInfoWindow = function (button) {
    if (mapConfig.activeInfoWindow) {
        mapConfig.activeInfoWindow.close()
        mapConfig.activeInfoWindow = null
    }
}
