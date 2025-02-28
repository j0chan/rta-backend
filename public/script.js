// API로 clientId 가져오기
fetch('/api/client-id')
    .then(response => response.json())
    .then(data => {
        // 네이버 지도 API 동적 로드
        const script = document.createElement('script')
        script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${data.clientId}`
        // API가 완전히 로드된 후 initMap() 실행되도록 수정
        script.onload = function () {
            initMap()
        }
        document.body.appendChild(script)
    })
    .catch(error => console.error('Error fetching client ID:', error))

let map
let markers = []
let infoWindows = []
let activeInfoWindow = null // 현재 열린 정보창 저장

function initMap() {
    map = new naver.maps.Map('map', {
        center: new naver.maps.LatLng(37.5665, 126.9780), // 초기 지도 위치 (서울)
        zoom: 15
    })

    // 현위치 가져오기
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                let lat = position.coords.latitude  // 위도
                let lng = position.coords.longitude // 경도
                let currentLocation = new naver.maps.LatLng(lat, lng)

                // 지도 중심을 현재 위치로 이동
                map.setCenter(currentLocation)

                // 현재 위치에 마커 추가
                let marker = new naver.maps.Marker({
                    position: currentLocation,
                    map: map
                })
            },
            function (error) {
                console.error("위치 정보를 가져올 수 없습니다: ", error)
            }
        )
    } else {
        alert("위치 정보를 지원하지 않는 브라우저입니다.")
    }

    // API가 로드된 후에만 검색 버튼 활성화
    document.querySelector("button").disabled = false

    // 지도 클릭 시 모든 InfoWindow 닫기
    naver.maps.Event.addListener(map, "click", function() {
        if (activeInfoWindow) {
            activeInfoWindow.close()
            activeInfoWindow = null // 열린 창이 없음을 표시
        }
    })

    // 엔터 키 입력 시 검색 실행
    document.getElementById('search-input').addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            searchPlaces()
        }
    })
}

function searchPlaces() {
    const query = document.getElementById('search-input').value
    if (!query) {
        alert('검색어를 입력하세요.')
        return
    }

    if (!map) {
        alert("지도가 아직 로드되지 않았습니다. 잠시 후 다시 시도하세요.")
        return
    }

    fetch(`/api/maps/search?query=${query}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.message)
                return
            }

            // 기존 마커 삭제
            markers.forEach(marker => marker.setMap(null))
            infoWindows.forEach(infoWindow => infoWindow.setMap(null))
            markers = []
            infoWindows = []

            // 검색 결과 마커 추가
            if (data && Array.isArray(data)) { // data가 존재하고 배열인지 확인
                if(data.length === 0){
                    alert('검색 결과가 없습니다.')
                    return
                }

                data.forEach(place => {
                    // 위치 정보가 없는 경우 건너뛰기
                    if (!place.mapx || !place.mapy) {
                        console.warn("위치 정보가 없는 장소:", place)
                        return
                    }

                    // 값을 string으로 나눠주기 때문에 숫자로 변환 후 계산 진행
                    let lat = parseFloat(place.mapy)
                    let lng = parseFloat(place.mapx)

                    // 좌표 계산 테스트용 (나중에 수정 필요)
                    if (lat > 90 || lng > 180) {
                        lat = lat / 1e7
                        lng = lng / 1e7
                    } else {
                        lat = lat / 1e6
                        lng = lng / 1e6
                    }

                    const marker = new naver.maps.Marker({ // 마커 객체
                        position: new naver.maps.LatLng(lat, lng), // position으로 마커 위치 지정
                        map: map // 마커를 어디에 표시할지
                    })

                    const infoWindow = new naver.maps.InfoWindow({
                        content: `
                            <div class="custom-infowindow">
                                <button onclick="closeInfoWindow()">❌</button>
                                <strong style="font-size: 18px; color: #333;">${place.title}</strong><br>
                                <a href="${place.link}" target="_blank" style="color: #007aff;">🔗 홈페이지 방문</a>
                                <hr>
                                <p>📌 카테고리: ${place.category || '정보 없음'}</p>
                                <p>🏢 주소: ${place.address}</p>
                                <p>🛣️ 도로명 주소: ${place.roadAddress || '정보 없음'}</p>
                                <p>📞 전화번호: ${place.telephone || '전화번호 없음'}</p>
                                <p>ℹ️ 설명: ${place.description || '설명 없음'}</p>
                            </div>`,
                            disableAutoPan: false, // 자동 이동 방지
                            borderWidth: 0, // 기본 테두리 제거
                            backgroundColor: "rgba(0,0,0,0)" // 투명 배경 적용
                    })

                    // 마커 클릭 시
                    naver.maps.Event.addListener(marker, "click", function() {
                        if (activeInfoWindow) {
                            activeInfoWindow.close() // 기존 열린 창 닫기
                        }
                        infoWindow.open(map, marker) // 새 창 열기
                        activeInfoWindow = infoWindow // 현재 창 저장
                    })

                    markers.push(marker)
                    infoWindows.push(infoWindow)
                })

                // 첫 번째 결과로 지도 이동
                if (data.length > 0) {
                    map.setCenter(new naver.maps.LatLng(data[0].mapy / 1e7, data[0].mapx / 1e7))
                    map.setZoom(16)
                }
            } else {
                alert('검색 결과가 없습니다.')
            }
        })
}

// 닫기 버튼 클릭 시 InfoWindow 닫기
function closeInfoWindow() {
    if (activeInfoWindow) {
        activeInfoWindow.close()
        activeInfoWindow = null
    }
}