# ブロック崩しRPG 機能仕様書

## 概要
ブロックを壊して経験値を稼ぎ、レベルアップによってパドルやボールを強化していく新感覚のアクションRPG。フロントエンドのみで動作し、バックエンドは使用しない。

## 主要機能

### 1. ゲーム基本機能

#### 1.1 ゲームフィールド
- **フィールドサイズ**: 800x600 ピクセル
- **境界**: 左右上の壁で反射、下の壁でボールロスト
- **背景色**: ダークテーマ（#0f172a）

#### 1.2 パドル操作
- **移動方法**: 
  - キーボード: 矢印キー（←→）またはA・Dキー
  - 連続入力による滑らかな移動
- **移動範囲**: フィールド左端から右端まで（境界内）
- **移動速度**: プレイヤーレベルに応じて可変（初期値: 300px/秒）
- **サイズ**: プレイヤーレベルに応じて可変（初期値: 100x20ピクセル）

#### 1.3 ボール物理システム
- **初期配置**: フィールド中央、パドル上方
- **初期速度**: 斜め上方向（角度ランダム）
- **速度**: プレイヤーレベルに応じて可変（初期値: 250px/秒）
- **反射ルール**:
  - 壁との衝突: 完全反射（入射角 = 反射角）
  - パドルとの衝突: パドルの接触位置により角度調整
    - 中央: 垂直上方向
    - 左端/右端: 斜め方向（最大45度）
  - ブロックとの衝突: 衝突面の法線ベクトルによる反射

#### 1.4 衝突判定システム
- **ボール vs 壁**: 円と直線の衝突判定
- **ボール vs パドル**: 円と矩形の衝突判定
- **ボール vs ブロック**: 円と矩形の衝突判定
- **衝突レスポンス**: 
  - 位置補正: 重複を解消する位置調整
  - 速度更新: 法線ベクトルによる反射計算

#### 1.5 ブロック配置とレベル設計
- **標準レイアウト**: 
  - 行数: 6行
  - 列数: 10列
  - ブロックサイズ: 75x25ピクセル
  - ブロック間隔: 5ピクセル
- **ブロック種類**:
  - 通常ブロック: 1回の衝突で破壊
  - モンスターブロック: 複数回の衝突が必要（HP制）
- **レベル進行**: 全ブロック破壊で次レベル自動生成

#### 1.6 ブロック破壊システム

##### 1.6.1 通常ブロック
- **耐久値**: 1（1回の衝突で破壊）
- **破壊エフェクト**: 破壊アニメーション（フェードアウト）
- **経験値**: 5 + (行番号 × 2) EXP
- **色分け**: 行ごとに異なる色（上の行ほど高価値）

##### 1.6.2 モンスターブロック破壊
- **HP制**: モンスタータイプに応じたHP
- **ダメージ計算**: 
  ```
  基本ダメージ = プレイヤーのボール威力
  最終ダメージ = 基本ダメージ × クリティカル倍率（発生時）
  ```
- **クリティカル判定**: プレイヤーのクリティカル率で発生
- **HP表示**: モンスターブロック上にHPバー表示
- **破壊条件**: HP ≤ 0 で破壊
- **報酬**:
  - 経験値: モンスタータイプごとの固定値
  - 追加報酬: スキルポイント（確率）

##### 1.6.3 破壊時の処理フロー
1. **衝突検出**: ボールとブロックの衝突判定
2. **ダメージ計算**: 
   - クリティカル判定実行
   - 最終ダメージ値算出
3. **HP減算**: ブロックの現在HPから減算
4. **破壊判定**: HP ≤ 0 で破壊フラグ設定
5. **報酬付与**: 
   - 経験値をプレイヤーに加算
   - レベルアップ判定実行
6. **エフェクト再生**: 破壊/ダメージアニメーション
7. **ボール反射**: 法線ベクトルによる反射処理

##### 1.6.4 特殊破壊効果
- **連鎖破壊**: 特定スキル発動時の周囲ブロック破壊
- **貫通破壊**: 貫通スキル発動時の複数ブロック破壊
- **爆発破壊**: 爆発スキル発動時の範囲破壊

#### 1.7 ゲームオーバー条件
- **ボールロスト**: ボールが画面下端を通過
- **ライフシステム**: 初期ライフ3、ボールロストで-1
- **ゲーム継続**: ライフ > 0 でボール再配置
- **ゲームオーバー**: ライフ = 0 でゲーム終了

#### 1.8 フレームレート制御
- **目標FPS**: 60FPS
- **フレーム制限**: requestAnimationFrame使用
- **デルタタイム**: 前フレームからの経過時間で移動量調整
- **パフォーマンス**: 60FPS維持できない場合の自動品質調整

#### 1.9 物理計算詳細仕様

##### 1.9.1 ボール移動計算
```javascript
// 位置更新
newX = currentX + velocityX * deltaTime
newY = currentY + velocityY * deltaTime

// 境界チェック
if (newX <= radius || newX >= canvasWidth - radius) {
  velocityX = -velocityX
  newX = clamp(newX, radius, canvasWidth - radius)
}
```

##### 1.9.2 パドル反射計算
```javascript
// パドルとの衝突点を計算
hitPosition = (ballX - paddleX) / paddleWidth // -0.5 ～ 0.5
angle = hitPosition * maxReflectionAngle // 最大45度

// 新しい速度ベクトル
speed = sqrt(velocityX² + velocityY²)
velocityX = speed * sin(angle)
velocityY = -speed * cos(angle) // 上向き
```

##### 1.9.3 ブロック反射計算
```javascript
// 衝突法線ベクトルの計算
centerX = blockX + blockWidth / 2
centerY = blockY + blockHeight / 2
dx = ballX - centerX
dy = ballY - centerY

// 衝突面の判定
if (abs(dx) > abs(dy)) {
  normal = { x: dx > 0 ? 1 : -1, y: 0 } // 左右面
} else {
  normal = { x: 0, y: dy > 0 ? 1 : -1 } // 上下面
}

// 反射ベクトルの計算
dot = velocityX * normal.x + velocityY * normal.y
velocityX = velocityX - 2 * dot * normal.x
velocityY = velocityY - 2 * dot * normal.y
```

##### 1.9.4 衝突判定アルゴリズム
```javascript
// 円と矩形の衝突判定
function circleRectCollision(circleX, circleY, radius, rectX, rectY, rectW, rectH) {
  const closestX = clamp(circleX, rectX, rectX + rectW)
  const closestY = clamp(circleY, rectY, rectY + rectH)
  
  const distanceX = circleX - closestX
  const distanceY = circleY - closestY
  const distanceSquared = distanceX² + distanceY²
  
  return distanceSquared <= radius²
}
```

##### 1.9.5 速度制限とスピード調整
```javascript
// 最低速度保証
minSpeed = 100 // px/秒
maxSpeed = playerBallSpeed * 1.5 // プレイヤー設定の1.5倍まで

currentSpeed = sqrt(velocityX² + velocityY²)
if (currentSpeed < minSpeed) {
  scale = minSpeed / currentSpeed
  velocityX *= scale
  velocityY *= scale
} else if (currentSpeed > maxSpeed) {
  scale = maxSpeed / currentSpeed
  velocityX *= scale
  velocityY *= scale
}
```

### 2. RPG要素
- 経験値（EXP）システム
- レベルシステム
- プレイヤーステータス管理

### 3. プレイヤー強化システム
- パドル強化（サイズ、スピード等）
- ボール強化（攻撃力、スピード等）
- レベルアップ時の自動強化

### 4. モンスターブロックシステム
- HP制モンスターブロック
- モンスター種別と特性
- 撃破時の報酬システム

### 5. スキルシステム
- レベル到達時のスキル習得
- スキル発動機能
- スキル効果の実装

### 6. UI/UXシステム
- ゲーム画面表示
- ステータス表示（レベル、EXP、HP等）
- スキル選択・発動UI
- ゲームオーバー・クリア画面

### 7. データ管理システム
- ローカルストレージでのセーブ機能
- ゲーム設定の保存
- プレイヤー進捗の永続化

### 8. ゲームバランス調整
- レベル進行曲線
- EXP獲得量の設定
- 難易度調整システム

## 技術要件
- フロントエンドのみで完結
- ローカルデータ管理
- レスポンシブ対応
- 60FPS維持

## 今後の拡張予定
- 追加スキルの実装
- 新しいモンスタータイプ
- アチーブメントシステム
- サウンド・エフェクト