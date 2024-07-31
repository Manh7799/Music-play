const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'F8_PLAYER';
const playlist = $('.playlist-list')
const heading = $('.dashboard header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playBtn = $('.btn-play')
const player = $('.player')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const volume = $('.volume-control')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,

    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    songs: [
        {
            name: 'Dám rực rỡ',
            singer: 'HIEUTHUHAI',
            path: './music/damrucro.mp3',
            image: './img/DamRucRo.jfif'
        },
        {
            name: 'Thiên ý',
            singer: 'Nhạc liên quân',
            path: './music/thieny.mp3',
            image: './img/ThienY.jfif'
        },
        {
            name: 'Dưới ánh hào quang ',
            singer: 'Nightcore',
            path: './music/DuoiAnhHaoQuang.mp3',
            image: './img/DuoiAnhHaoQuang.jfif'
        },
        {
            name: 'Bộ tộc cùng già',
            singer: 'Độ MiXi',
            path: './music/botoccunggia.mp3',
            image: './img/BoTocCungGia.jfif'
        },
        {
            name: 'Chìm Sâu',
            singer: 'MCK',
            path: './music/chimsau.mp3',
            image: './img/ChimSau.jfif'
        },
        {
            name: 'Don\'t Côi',
            singer: 'Ogenus',
            path: './music/don\'ncoi.mp3',
            image: './img/DonCoi.jfif'
        },
        {
            name: 'Độ tộc 2',
            singer: 'Độ Mixi',
            path: './music/DoToc2.mp3',
            image: './img/DoToc2.jfif'
        },
        {
            name: 'Lệ lưu ly',
            singer: 'Vũ phụng tiên',
            path: './music/LeLuuLy.mp3',
            image: './img/LeLuuLy.jfif'
        },
        {
            name: 'Remember Me',
            singer: 'Sơn tùng MTP',
            path: './music/RememberMe.mp3',
            image: './img/rememberme.jfif'
        },
        {
            name: 'Nếu lúc đó',
            singer: 'Tlinh',
            path: './music/NeuLucDo.mp3',
            image: './img/NeuLucDo.jfif'
        },
    ],

    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index = "${index}"">
                <div class="thumb"
                    style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title"> ${song.name} </h3>
                    <p class="author"> ${song.singer} </p>
                </div>
                <div class="option">
                    <i class="glyphicon glyphicon-option-vertical"></i>
                </div>
            </div>                   
             `
        })
        playlist.innerHTML = htmls.join('')
    },

    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            }
        })
    },

    handleEvents: function () {
        const _this = this

        // Xử lý CD quay
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 15000,
            iterations: Infinity
        });

        cdThumbAnimate.pause()

        // Xử lý khi click play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }

        // Khi bài hát phát
        audio.onplay = function () {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        // Khi bài hát dừng
        audio.onpause = function () {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        //Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }

        //Xử lý khi tua bài hát
        progress.onchange = function (e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }

        //Xử lý âm thanh
        volume.addEventListener('input', function () {
            audio.volume = volume.value / 100;
        });

        // Khi next song
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
        }

        // Khi prev song
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
        }

        // Khi random song
        randomBtn.onclick = function (e) {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        //Khi replay song
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        // Xử lý next xong khi bài hát hết
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }

        // Xử lý khi click vào playList
        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)')
            if (songNode || e.target.closest('option')) {
                // Xử lý khi click vào song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }

                //Xử lý khi nhấn vào option
                if (e.target.closest('option')) {

                }
            }
        }
    },



    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },

    nextSong: function () {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },

    prevSong: function () {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },

    playRandomSong: function () {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentSong)

        this.currentIndex = newIndex
        this.loadCurrentSong()
    },

    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    start: function () {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig();

        // Định nghĩa các thuộc tính cho object
        this.defineProperties()

        // Lắng nghe / xử lý các sự kiện ( DOM event )
        this.render()

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong()

        // Render playlists
        this.handleEvents()

        // Hiển thị trạng thái ban đầu của random và repeat
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);

    }
}
app.start()