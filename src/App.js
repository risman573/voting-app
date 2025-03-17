import React, { useState, useEffect } from 'react';
import './App.css';
import Swal from 'sweetalert2';

const API_URL = 'https://app-89af645b-a3a8-49a3-9433-3c843927cd06.cleverapps.io';

function App() {
  const deviceId = localStorage.getItem('deviceId') || Date.now().toString();
  localStorage.setItem('deviceId', deviceId);

  const [votes, setVotes] = useState(() => {
    const savedVotes = localStorage.getItem('votes');
    return savedVotes ? JSON.parse(savedVotes) : [];
  });

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  const [skipPosition, setSkipPosition] = useState(0);
  const maxOffset = 50;

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    document.body.className = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  // New useEffect to fetch votes from the backend
  useEffect(() => {
    const fetchVotes = () => {
      fetch(`${API_URL}/api/votes`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          // console.log("Data dari backend:", data); // ✅ Log data yang diterima
          setVotes(data); // Update state dengan data dari backend
        })
        .catch(error => {
          console.error('There was a problem with the fetch operation:', error);
        });
    };

    fetchVotes(); // Panggil fetch saat komponen pertama kali mount
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  const handleVote = (voteType) => {
    const deviceTimestamp = new Date().toISOString(); // Waktu dari perangkat

    const newVote = {
        deviceId: deviceId,
        vote: voteType,
        timestamp: deviceTimestamp
    };

    fetch(`${API_URL}/api/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVote),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Anda sudah memberikan suara!') {
            Swal.fire({
                icon: 'warning',
                title: 'Peringatan',
                text: data.message,
            });
        } else {
            console.log(data.message);
            setVotes([...votes, newVote]);
            Swal.fire({
                icon: 'success',
                title: 'Terima Kasih!',
                text: `Anda telah memilih "${voteType}"`,
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Voting gagal. Silakan coba lagi.',
        });
    });
  };

  const handleSkipVote = () => {
    setSkipPosition(prev => (prev === maxOffset ? -maxOffset : maxOffset));
  };

  const handleReset = () => {
    Swal.fire({
      title: 'Konfirmasi Reset',
      text: 'Masukkan password untuk melanjutkan:',
      input: 'password',
      showCancelButton: true,
      confirmButtonText: 'Reset',
      cancelButtonText: 'Batal',
      preConfirm: (password) => {
        if (password !== 'kaudanaku') {
          Swal.showValidationMessage('Password salah!');
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${API_URL}/api/votes`, {
          method: 'DELETE',
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          console.log(data.message);
          setVotes([]); // Kosongkan state
          localStorage.removeItem('votes'); // Hapus dari localStorage
          Swal.fire('Berhasil!', 'Voting telah direset.', 'success');
        })
        .catch(error => {
          console.error('Error deleting votes:', error);
          Swal.fire('Error', 'Gagal mereset voting.', 'error');
        });
      }
    });
  };

  const getVoteCounts = () => {
    const gasCount = votes.filter(v => v.vote === 'Gas').length;
    const skipCount = votes.filter(v => v.vote === 'Skip').length;
    return { gasCount, skipCount };
  };

  return (
    <div className={`App ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <header className="App-header">
        <button className="toggle-mode" onClick={toggleDarkMode}>
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
        <h2>
          Ubur - Ubur Ikan Lele <br/>
          Ayo Bukber Le ?
        </h2>
        <div className="vote-buttons">
          <button onClick={() => handleVote('Gas')}>Gas</button>
          <button
            id="skip-button"
            onClick={handleSkipVote}
            style={{ transform: `translateX(${skipPosition}px)`, transition: 'transform 0.3s ease-in-out' }}
          >
            Skip
          </button>
        </div>
        <div className="voting-results">
          <h2>Hasil Voting</h2>
          <table className="vote-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Device ID</th>
                <th>Pilihan</th>
                <th>Waktu Vote</th>
              </tr>
            </thead>
            <tbody>
              {votes.map((vote, index) => (
                <tr key={vote.id}>
                  <td>{index + 1}</td>
                  <td>{vote.deviceId}</td>
                  <td>{vote.vote}</td>
                  <td>{new Date(vote.timestamp).toLocaleString("en-CA", { timeZone: "Asia/Jakarta" }).replace(",", "")}</td>
                </tr>
              ))}
              <tr>
                <td colSpan="3"><strong>Total Gas:</strong></td>
                <td>{getVoteCounts().gasCount}</td>
              </tr>
              <tr>
                <td colSpan="3"><strong>Total Skip:</strong></td>
                <td>{getVoteCounts().skipCount}</td>
              </tr>
            </tbody>
          </table>
        </div>
        {votes.length > 0 && <div className="vote-summary">
          <button className="reset-button" onClick={handleReset}>
            Reset Voting
          </button>
        </div>}
      </header>
    </div>
  );
}

export default App;
