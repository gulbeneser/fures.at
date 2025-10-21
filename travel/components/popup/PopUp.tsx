/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// FIX: Added FC to the React import.
import React, { FC } from 'react';
import './PopUp.css';

interface PopUpProps {
  onClose: () => void;
}

const PopUp: React.FC<PopUpProps> = ({ onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>İnteraktif Gün Planlayıcıya Hoş Geldiniz</h2>
        <div className="popup-scrollable-content">
          <p>
            Bu interaktif demo, Gemini ve Google Haritalar ile Konum Bilgisi'nin gerçek zamanlı, sesli sohbet yeteneklerini sergiliyor.
            Doğal dil kullanarak bir günlük gezi planlayın ve Gemini'nin doğru, güncel bilgiler sunmak için Google Haritalar'ı nasıl kullandığını deneyimleyin.
          </p>
          <p>Başlamak için:</p>
          <ol>
            <li>
              <span className="icon">play_circle</span>
              <div>Sohbeti başlatmak için <strong>&nbsp; Oynat &nbsp;</strong> düğmesine basın.</div>
            </li>
            <li>
              <span className="icon">record_voice_over</span>
              <div>Gezi planınızı yapmak için <strong>&nbsp;doğal bir şekilde konuşun&nbsp;</strong>. "Haydi Gazimağusa'ya bir gezi planlayalım" demeyi deneyin.</div>
            </li>
            <li>
              <span className="icon">map</span>
              <div>Haritanın, gezi rotanızdaki yerlerle <strong>&nbsp; dinamik olarak güncellenmesini &nbsp;</strong> izleyin.</div>
            </li>
            <li>
              <span className="icon">keyboard</span>
              <div>Alternatif olarak, isteklerinizi mesaj kutusuna <strong>&nbsp; yazabilirsiniz &nbsp;</strong>.</div>
            </li>
            <li>
              <span className="icon">tune</span>
              <div>Yapay zekanın sesini ve davranışını özelleştirmek için <strong>&nbsp; Ayarlar &nbsp;</strong> simgesine tıklayın.</div>
            </li>
          </ol>
        </div>
        <button onClick={onClose}>Anladım, Haydi Planlayalım!</button>
      </div>
    </div>
  );
};

export default PopUp;