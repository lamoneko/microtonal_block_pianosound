////Web Audio APIを使う
//AudioContextクラスのコンストラクタを呼び出して，AudioContextインスタンスを生成する必要がある．
const audioContext = new (window.AudioContext || window.webkitAudioContext)(); //Web Audio APIを使用して音声を操作するためのAudio Contextを作成する

const keyMap = '1234567890QWERTYUIOPASDFGHJKLZXCVBNM'.split(''); //キーボードのキーと対応する周波数をマッピングするための'keyMap'を定義

let frequencies = [];  //生成された周波数を格納するための配列

let oscillators = {};  //オシレーターを管理するためのオブジェクト

let chord = []; //和音を保存するための配列

let chordCounts = {}; ////和音の出現頻度を保存するオブジェクト


// //音を再生するためのオシレーターを作成し，再生する
// function startPlayingFrequency(frequency, key) {

//     const oscillator = audioContext.createOscillator();
//     oscillator.type = 'sine'; //オシレーターのタイプをサイン波に設定

//     oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

//     oscillator.connect(audioContext.destination); //オシレーターをオーディオの出力に接続する
//     oscillator.start(); //オシレータを再生する
//     oscillators[key] = oscillator; // オシレータをosillatorsオブジェクトに保存

//     //入力された音をコンソールに表示
//     console.log("Input frequency:",frequency.toFixed(2)); 

//     // 和音に周波数を追加する
//     chord.push(frequency.toFixed(2));

// }

//音を出す関数
function startPlayingFrequency(frequency,key) {

    //2種類の音を作る
    var oscillator = audioContext.createOscillator();
    var oscillator2 = audioContext.createOscillator();

    //2種類目の音は1オクターブ上（Hzが2倍でオクターブ上）
    oscillator.frequency.value = frequency;
    oscillator2.frequency.value = frequency * 2;

    //音量(Gain)変更フィルター
    var gainNode = audioContext.createGain();
    var gainNode2 = audioContext.createGain();

    //音の出始める時刻を取得
    var currentTime = audioContext.currentTime;

    //音を線形に音量変化させる
    gainNode.gain.linearRampToValueAtTime(1, currentTime);
    gainNode.gain.linearRampToValueAtTime(0, currentTime + 0.6);

    //2種類目の音は音量を小さく初めて少し長めに
    gainNode2.gain.linearRampToValueAtTime(0.2, currentTime);
    gainNode2.gain.linearRampToValueAtTime(0, currentTime + 0.6);

    //まず音量変更フィルタに作った音を通す
    oscillator.connect(gainNode);
    oscillator2.connect(gainNode2);
    var audioDestination = audioContext.destination;

    //フィルタに通った音をスピーカーに接続
    gainNode.connect(audioDestination);
    gainNode2.connect(audioDestination);
    oscillator.start = oscillator.start || oscillator.noteOn;
    oscillator2.start = oscillator2.start || oscillator2.noteOn;
    oscillator.start();
    oscillator2.start();

    oscillators[key] = oscillator,oscillator2; // オシレータをosillatorsオブジェクトに保存

    //入力された音をコンソールに表示
    console.log("Input frequency:",frequency.toFixed(2)); 

    // 和音に周波数を追加する
    chord.push(frequency.toFixed(2));

}



//和音が鳴らされているかどうかをチェックする関数
function checkChord(){
    // 現在の和音に既に2つ以上の周波数が含まれている場合、和音として保存
    if (chord.length >= 2) {
        chord.push(chord);
        console.log("Chord:", chord); //コンソールに表示

        ////和音の周波数をソートして一意な識別子に変換
        const chordIdentifier = chord.sort().join(','); //和音の周波数を昇順にソート＋ソートされた周波数をカンマ区切りの文字列に変換する
        ////和音の出現頻度をカウントする
        chordCounts[chordIdentifier] = (chordCounts[chordIdentifier] || 0) + 1; //和音の出現回数を1増やす，和音がカウントされていない場合は0
        console.log(chordCounts);
    }
    chord = []; // 現在の和音をリセット
}

//指定されたキーに対応するオシレーターの停止，削除
function stopPlayingFrequency(key) {
    if (oscillators[key]) {
        oscillators[key].stop(); 
        oscillators[key].disconnect(); //オシレーターをオーディオの出力から切断する
        delete oscillators[key]; //停止したオシレーターを削除する
    }
    checkChord(); //和音が鳴らされたかをチェック
}

//キーボードのスケールを生成する
function generateScale() {
    const division = Math.min(document.getElementById('division').value, 31); // 最大31分割まで
    const rootFrequency = 440; // A4の周波数
    frequencies = [];

    for (let i = 0; i < division; i++) {
        const frequency = rootFrequency * Math.pow(2, i / division);
        frequencies.push(frequency); //計算された周波数をfrequencies配列に追加する
    }
    updateKeyboardLayout(division); //分割数に応じてキーボードの見た目を更新する
}

////ブロック型の作成
function updateKeyboardLayout(division) { //引数divisionを受け取る(キーボード全体をいくつの部分に分割するかを指定)
    const notesDiv = document.getElementById('keyboard-container'); //
    const freqDiv = document.getElementById('frequencies'); //
    notesDiv.innerHTML = ''; //以前のキーボードレイアウトをクリア(前のレイアウトを消去)
    freqDiv.innerHTML = ''; // 周波数表示エリアをクリア(前の周波数表示を消去)
    const keyWidth = 50; // 鍵盤の幅
    const keyHeight = 200; // 鍵盤の高さ
    const margin =5 ; //鍵盤の間隔

    for (let i = 0; i < division; i++) {
        const x = i * (keyWidth+margin); // 鍵盤ごとに横方向に配置
        const y = 0; //縦（変わらない）

        const noteDiv = document.createElement('div');
        noteDiv.className = 'note'; //
        noteDiv.style.left = `${x}px`;
        noteDiv.style.top = `${y}px`;
        noteDiv.style.width = `${keyWidth}px`;
        noteDiv.style.height = `${keyHeight}px`;
        noteDiv.style.background = 'white'; // 鍵盤の色
        noteDiv.textContent = keyMap[i];
        noteDiv.onclick = () => playFrequency(frequencies[i], i); // クリックで音を再生
        notesDiv.appendChild(noteDiv);

        const freqSpan = document.createElement('div');
        freqSpan.innerHTML = `${keyMap[i]}=${frequencies[i].toFixed(2)}Hz `;
        freqDiv.appendChild(freqSpan);
    }
}

////キーボード制御
//キーが押されたときに呼び出される関数
function handleKeyDown(event) { 

    const key = event.key.toUpperCase(); //イベントから押されたキーを取得し、大文字に変換してkey に格納する。これにより、大文字と小文字のキーの区別をなくす。
    const keyIndex = keyMap.indexOf(key); //
    if (keyIndex >= 0 && keyIndex < frequencies.length && !oscillators[key]) {
        startPlayingFrequency(frequencies[keyIndex], key);
    }
    // 押された鍵盤の色を変更する
    const noteDiv = document.getElementsByClassName('note')[keyIndex];
    noteDiv.style.background = 'lightgray'; // 背景色を変更
    noteDiv.style.border = 'solid black 2px'; // 枠の色を変更

}

//キーが離されたときに呼び出される関数
function handleKeyUp(event) { 

    const notes = document.getElementsByClassName('note');
    const key = event.key.toUpperCase();
    if (oscillators[key]) {
        stopPlayingFrequency(key);
    }

    // 鍵盤の色付けを元に戻す
    const keyIndex = keyMap.indexOf(key);
    const noteDiv = document.getElementsByClassName('note')[keyIndex];
    noteDiv.style.background = 'white'; // 背景色を元に戻す
    noteDiv.style.border = 'solid black 1px'; // 枠の色を元に戻す

}


////初期化
window.onload = () => { 
    generateScale();
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
};

