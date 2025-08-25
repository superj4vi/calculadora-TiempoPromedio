function parseTimeToSeconds(timeStr) {
	timeStr = timeStr.trim();
	if (timeStr.includes(':')) {
		const parts = timeStr.split(':').map(num => parseInt(num) || 0);
		if (parts.length === 3) {
			const [hours, minutes, seconds] = parts;
			return hours * 3600 + minutes * 60 + seconds;
		} else if (parts.length === 2) {
			const [hours, minutes] = parts;
			return hours * 3600 + minutes * 60;
		}
	} else if (timeStr.includes('.')) {
		const decimal = parseFloat(timeStr);
		return Math.round(decimal * 3600);
	} else {
		const hours = parseInt(timeStr) || 0;
		return hours * 3600;
	}
	return 0;
}

function secondsToHoursMinutesSeconds(totalSeconds) {
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	return { hours, minutes, seconds };
}

function formatTime(hours, minutes, seconds = 0) {
	if (seconds > 0) {
		return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	}
	return `${hours}:${minutes.toString().padStart(2, '0')}`;
}

function processHours(input) {
	const lines = input.split(/[\n,]/).filter(line => line.trim());
	if (lines.length === 0) {
		throw new Error('No se encontraron horas válidas en el texto');
	}

	let totalSeconds = 0;
	const processedHours = [];

	for (let line of lines) {
		line = line.trim();
		if (!line) continue;

		try {
			const seconds = parseTimeToSeconds(line);
			if (seconds > 0) {
				totalSeconds += seconds;
				const { hours, minutes, seconds: secs } = secondsToHoursMinutesSeconds(seconds);
				processedHours.push({
					original: line,
					formatted: formatTime(hours, minutes, secs),
					seconds: seconds
				});
			}
		} catch (e) {
			console.warn(`No se pudo procesar: ${line}`);
		}
	}

	if (processedHours.length === 0) {
		throw new Error('No se encontraron horas válidas para procesar');
	}

	return { totalSeconds, processedHours };
}

function displayResults(totalSeconds, processedHours) {
	const { hours, minutes, seconds } = secondsToHoursMinutesSeconds(totalSeconds);
	const totalMinutes = Math.floor(totalSeconds / 60);
	const averageSecondsPerTicket = totalSeconds / processedHours.length;
	const { hours: avgHours, minutes: avgMinutes, seconds: avgSeconds } = secondsToHoursMinutesSeconds(Math.round(averageSecondsPerTicket));
	const totalHoursDecimal = totalSeconds / 3600;
	const averagePerDayDecimal = totalHoursDecimal / 24 / processedHours.length;

	document.getElementById('totalHours').textContent = formatTime(hours, minutes, seconds);
	document.getElementById('totalMinutes').textContent = totalMinutes;
	document.getElementById('totalSeconds').textContent = totalSeconds;
	document.getElementById('hoursCount').textContent = processedHours.length;
	document.getElementById('averageTime').textContent = formatTime(avgHours, avgMinutes, avgSeconds);
	document.getElementById('averagePerDay').textContent = averagePerDayDecimal.toFixed(4) + ' días';

	// const hoursList = document.getElementById('hoursList');
	// hoursList.innerHTML = processedHours.map((hour, index) =>
	// 	`<div class="flex justify-between items-center py-1 ${index % 2 === 0 ? 'bg-white' : ''} px-2 rounded">
	//     <span class="text-gray-600">${hour.original}</span>
	//     <span class="font-medium text-gray-800">${hour.formatted}</span>
	//   </div>`
	// ).join('');

	const resultsDiv = document.getElementById('results');
	resultsDiv.classList.remove('hidden');
	resultsDiv.classList.add('fade-in');

	hideError();
}

function showError(message) {
	const errorDiv = document.getElementById('errorMessage');
	document.getElementById('errorText').textContent = message;
	errorDiv.classList.remove('hidden');
	errorDiv.classList.add('fade-in');
}

function hideError() {
	document.getElementById('errorMessage').classList.add('hidden');
}

function calculateFromText() {
	const input = document.getElementById('hoursInput').value;
	if (!input.trim()) {
		showError('Por favor, ingresa algunas horas para calcular');
		return;
	}

	try {
		const { totalSeconds, processedHours } = processHours(input);
		displayResults(totalSeconds, processedHours);
	} catch (error) {
		showError(error.message);
	}
}

function handleFileUpload(event) {
	const file = event.target.files[0];
	if (!file) return;

	const reader = new FileReader();
	reader.onload = function (e) {
		const content = e.target.result;
		try {
			const { totalSeconds, processedHours } = processHours(content);
			displayResults(totalSeconds, processedHours);
			document.getElementById('hoursInput').value = content;
		} catch (error) {
			showError(`Error al procesar el archivo: ${error.message}`);
		}
	};

	reader.onerror = function () {
		showError('Error al leer el archivo. Por favor, intenta de nuevo.');
	};

	reader.readAsText(file);
}

document.getElementById('hoursInput').addEventListener('keypress', function (e) {
	if (e.key === 'Enter' && e.ctrlKey) {
		calculateFromText();
	}
});
