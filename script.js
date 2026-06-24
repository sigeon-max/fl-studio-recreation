// FL Studio Web Simulator - Main JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application
    initHintPanel();
    initKnobsAndSliders();
    initContextMenu();
    initTransportControls();
    initPluginWindows();
    initBrowser();
    initChannelRack();
    initMixer();
    initPlaylist();
    initScrollmarsey();
    initOTTPlugin();
    initSoundFontPlayer();
    initFLEXPlugin();
});

// Hint Panel
function initHintPanel() {
    const hintText = document.getElementById('hint-text');
    
    // Add mouseover event to all elements with data-hint attribute
    document.querySelectorAll('[data-hint]').forEach(element => {
        element.addEventListener('mouseover', () => {
            hintText.textContent = element.getAttribute('data-hint');
        });
        
        element.addEventListener('mouseout', () => {
            hintText.textContent = 'Move mouse over controls to see hints';
        });
    });
}

// Knobs and Sliders
function initKnobsAndSliders() {
    // Initialize all knobs
    document.querySelectorAll('.knob').forEach(knob => {
        let value = 50; // Default value (0-100)
        let isDragging = false;
        let startY, startValue;
        
        // Set initial rotation
        updateKnobRotation(knob, value);
        
        // Mouse down event
        knob.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left click
                isDragging = true;
                startY = e.clientY;
                startValue = value;
                e.preventDefault();
            }
        });
        
        // Mouse move event (document level)
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaY = startY - e.clientY;
                const sensitivity = e.ctrlKey ? 0.5 : 2; // Fine adjustment with CTRL
                
                // Calculate new value
                let newValue = startValue + deltaY * sensitivity;
                
                // Skip snapping if SHIFT is held
                if (!e.shiftKey) {
                    // Snap to 0%, 25%, 50%, 75%, 100%
                    const snapPoints = [0, 25, 50, 75, 100];
                    for (const point of snapPoints) {
                        if (Math.abs(newValue - point) < 3) {
                            newValue = point;
                            break;
                        }
                    }
                }
                
                // Clamp value between 0 and 100
                value = Math.max(0, Math.min(100, newValue));
                
                // Update knob rotation
                updateKnobRotation(knob, value);
                
                // Update associated value display if exists
                const valueDisplay = knob.parentElement.querySelector('.parameter-value');
                if (valueDisplay) {
                    // Different formatting based on parameter
                    const paramName = knob.parentElement.querySelector('.parameter-label').textContent;
                    valueDisplay.textContent = formatParameterValue(paramName, value);
                }
            }
        });
        
        // Mouse up event (document level)
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        // Middle click to reset
        knob.addEventListener('mousedown', (e) => {
            if (e.button === 1) { // Middle click
                value = 50; // Reset to default
                updateKnobRotation(knob, value);
                e.preventDefault();
            }
        });
        
        // ALT + Left click to reset
        knob.addEventListener('click', (e) => {
            if (e.altKey) { // ALT + Left click
                value = 50; // Reset to default
                updateKnobRotation(knob, value);
                e.preventDefault();
            }
        });
        
        // Context menu for type in value
        knob.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showContextMenu(e.clientX, e.clientY, knob);
        });
    });
    
    // Initialize all sliders
    document.querySelectorAll('.slider').forEach(slider => {
        let value = 50; // Default value (0-100)
        let isDragging = false;
        let startPos, startValue;
        const isHorizontal = slider.classList.contains('horizontal');
        
        // Set initial position
        updateSliderPosition(slider, value, isHorizontal);
        
        // Mouse down event
        slider.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left click
                isDragging = true;
                startPos = isHorizontal ? e.clientX : e.clientY;
                startValue = value;
                e.preventDefault();
            }
        });
        
        // Mouse move event (document level)
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const delta = isHorizontal 
                    ? (e.clientX - startPos) 
                    : (startPos - e.clientY);
                const sensitivity = e.ctrlKey ? 0.5 : 1; // Fine adjustment with CTRL
                
                // Calculate new value
                let newValue = startValue + delta * sensitivity;
                
                // Skip snapping if SHIFT is held
                if (!e.shiftKey) {
                    // Snap to 0%, 25%, 50%, 75%, 100%
                    const snapPoints = [0, 25, 50, 75, 100];
                    for (const point of snapPoints) {
                        if (Math.abs(newValue - point) < 3) {
                            newValue = point;
                            break;
                        }
                    }
                }
                
                // Clamp value between 0 and 100
                value = Math.max(0, Math.min(100, newValue));
                
                // Update slider position
                updateSliderPosition(slider, value, isHorizontal);
            }
        });
        
        // Mouse up event (document level)
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        // Middle click to reset
        slider.addEventListener('mousedown', (e) => {
            if (e.button === 1) { // Middle click
                value = 50; // Reset to default
                updateSliderPosition(slider, value, isHorizontal);
                e.preventDefault();
            }
        });
        
        // ALT + Left click to reset
        slider.addEventListener('click', (e) => {
            if (e.altKey) { // ALT + Left click
                value = 50; // Reset to default
                updateSliderPosition(slider, value, isHorizontal);
                e.preventDefault();
            }
        });
        
        // Context menu for type in value
        slider.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showContextMenu(e.clientX, e.clientY, slider);
        });
    });
}

// Helper function to update knob rotation
function updateKnobRotation(knob, value) {
    // Map value (0-100) to rotation (-135 to 135 degrees)
    const rotation = (value / 100) * 270 - 135;
    knob.style.setProperty('--rotation', `${rotation}deg`);
    knob.querySelector('::after') // This won't work, need to use a different approach
    // We'll use a CSS custom property instead
    knob.style.transform = `rotate(${rotation}deg)`;
}

// Helper function to update slider position
function updateSliderPosition(slider, value, isHorizontal) {
    // Update the ::after pseudo-element position
    // Since we can't directly manipulate pseudo-elements, we'll use a CSS custom property
    slider.style.setProperty('--position', `${value}%`);
}

// Helper function to format parameter value based on parameter name
function formatParameterValue(paramName, value) {
    // Different formatting based on parameter
    if (paramName.includes('Depth') || paramName.includes('Time')) {
        return `${Math.round(value)}%`;
    } else if (paramName.includes('X-Over Low')) {
        // Map 0-100 to 40-400 Hz (logarithmic scale)
        const freq = 40 * Math.pow(10, (value / 100) * Math.log10(400 / 40));
        return `${Math.round(freq)} Hz`;
    } else if (paramName.includes('X-Over High')) {
        // Map 0-100 to 1000-8000 Hz (logarithmic scale)
        const freq = 1000 * Math.pow(10, (value / 100) * Math.log10(8000 / 1000));
        return `${Math.round(freq)} Hz`;
    } else if (paramName.includes('Gain')) {
        // Map 0-100 to -12 to +12 dB
        const db = (value / 100) * 24 - 12;
        return `${db.toFixed(1)} dB`;
    } else {
        return `${Math.round(value)}%`;
    }
}

// Context Menu
function initContextMenu() {
    const contextMenu = document.getElementById('context-menu');
    
    // Hide context menu on click anywhere
    document.addEventListener('click', () => {
        contextMenu.classList.add('hidden');
    });
    
    // Context menu item actions
    contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const action = item.getAttribute('data-action');
            const targetElement = contextMenu.targetElement;
            
            if (action === 'type-value' && targetElement) {
                // Create input for typing value
                const input = document.createElement('input');
                input.type = 'number';
                input.min = '0';
                input.max = '100';
                input.value = '50';
                input.style.position = 'absolute';
                input.style.left = `${contextMenu.style.left}px`;
                input.style.top = `${contextMenu.style.top}px`;
                input.style.zIndex = '2001';
                
                document.body.appendChild(input);
                input.focus();
                input.select();
                
                const handleInput = () => {
                    const value = parseFloat(input.value);
                    if (!isNaN(value)) {
                        // Update the target element with the new value
                        if (targetElement.classList.contains('knob')) {
                            updateKnobRotation(targetElement, value);
                        } else if (targetElement.classList.contains('slider')) {
                            const isHorizontal = targetElement.classList.contains('horizontal');
                            updateSliderPosition(targetElement, value, isHorizontal);
                        }
                    }
                    document.body.removeChild(input);
                };
                
                input.addEventListener('blur', handleInput);
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        handleInput();
                    }
                });
            } else if (action === 'reset' && targetElement) {
                // Reset to default value
                if (targetElement.classList.contains('knob')) {
                    updateKnobRotation(targetElement, 50);
                } else if (targetElement.classList.contains('slider')) {
                    const isHorizontal = targetElement.classList.contains('horizontal');
                    updateSliderPosition(targetElement, 50, isHorizontal);
                }
            }
            
            contextMenu.classList.add('hidden');
            e.stopPropagation();
        });
    });
}

// Show context menu at position
function showContextMenu(x, y, targetElement) {
    const contextMenu = document.getElementById('context-menu');
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
    contextMenu.targetElement = targetElement;
    contextMenu.classList.remove('hidden');
}

// Transport Controls
function initTransportControls() {
    const playButton = document.getElementById('play-button');
    const stopButton = document.getElementById('stop-button');
    const recordButton = document.getElementById('record-button');
    const timeDisplay = document.querySelector('.time-display');
    const tempoDisplay = document.querySelector('.tempo-display');
    const patternDisplay = document.querySelector('.pattern-display');
    
    let isPlaying = false;
    let isRecording = false;
    let startTime = 0;
    let elapsedTime = 0;
    let animationFrameId = null;
    let tempo = 140.0;
    let currentPattern = 1;
    
    // Play button
    playButton.addEventListener('click', () => {
        if (isPlaying) {
            // Pause
            isPlaying = false;
            playButton.classList.remove('active');
            cancelAnimationFrame(animationFrameId);
        } else {
            // Play
            isPlaying = true;
            playButton.classList.add('active');
            startTime = Date.now() - elapsedTime;
            updateTimeDisplay();
        }
    });
    
    // Stop button
    stopButton.addEventListener('click', () => {
        isPlaying = false;
        playButton.classList.remove('active');
        cancelAnimationFrame(animationFrameId);
        elapsedTime = 0;
        updateTimeDisplay();
    });
    
    // Record button
    recordButton.addEventListener('click', () => {
        isRecording = !isRecording;
        recordButton.classList.toggle('active', isRecording);
    });
    
    // Update time display
    function updateTimeDisplay() {
        if (isPlaying) {
            elapsedTime = Date.now() - startTime;
            const totalMs = elapsedTime;
            const ms = totalMs % 1000;
            const totalSeconds = Math.floor(totalMs / 1000);
            const seconds = totalSeconds % 60;
            const totalMinutes = Math.floor(totalSeconds / 60);
            const minutes = totalMinutes % 60;
            const hours = Math.floor(totalMinutes / 60);
            
            timeDisplay.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad3(ms)}`;
            animationFrameId = requestAnimationFrame(updateTimeDisplay);
        } else {
            const totalMs = elapsedTime;
            const ms = totalMs % 1000;
            const totalSeconds = Math.floor(totalMs / 1000);
            const seconds = totalSeconds % 60;
            const totalMinutes = Math.floor(totalSeconds / 60);
            const minutes = totalMinutes % 60;
            const hours = Math.floor(totalMinutes / 60);
            
            timeDisplay.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad3(ms)}`;
        }
    }
    
    // Tempo display
    tempoDisplay.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '20';
        input.max = '999';
        input.value = tempo;
        input.style.width = '60px';
        
        tempoDisplay.textContent = '';
        tempoDisplay.appendChild(input);
        input.focus();
        input.select();
        
        const handleInput = () => {
            const newTempo = parseFloat(input.value);
            if (!isNaN(newTempo) && newTempo >= 20 && newTempo <= 999) {
                tempo = newTempo;
            }
            tempoDisplay.textContent = `${tempo.toFixed(1)}`;
        };
        
        input.addEventListener('blur', handleInput);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleInput();
            }
        });
    });
    
    // Pattern display
    patternDisplay.addEventListener('click', () => {
        currentPattern = currentPattern >= 999 ? 1 : currentPattern + 1;
        patternDisplay.textContent = `Pattern ${currentPattern}`;
    });
    
    // Helper functions
    function pad(num) {
        return num.toString().padStart(2, '0');
    }
    
    function pad3(num) {
        return num.toString().padStart(3, '0');
    }
}

// Plugin Windows
function initPluginWindows() {
    // Make plugin windows draggable
    document.querySelectorAll('.plugin-header').forEach(header => {
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;
        const pluginWindow = header.parentElement;
        
        header.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('plugin-menu-icon') || 
                e.target.classList.contains('plugin-minimize') || 
                e.target.classList.contains('plugin-maximize') || 
                e.target.classList.contains('plugin-close')) {
                return;
            }
            
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            
            const rect = pluginWindow.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;
            
            pluginWindow.style.position = 'fixed';
            pluginWindow.style.left = `${initialLeft}px`;
            pluginWindow.style.top = `${initialTop}px`;
            pluginWindow.style.right = 'auto';
            pluginWindow.style.bottom = 'auto';
            pluginWindow.style.zIndex = '1001';
            
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                
                pluginWindow.style.left = `${initialLeft + deltaX}px`;
                pluginWindow.style.top = `${initialTop + deltaY}px`;
            }
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    });
    
    // Plugin window controls
    document.querySelectorAll('.plugin-close').forEach(button => {
        button.addEventListener('click', () => {
            button.closest('.plugin-window').classList.add('hidden');
        });
    });
    
    document.querySelectorAll('.plugin-minimize').forEach(button => {
        button.addEventListener('click', () => {
            const pluginWindow = button.closest('.plugin-window');
            const pluginContent = pluginWindow.querySelector('.plugin-content');
            
            if (pluginContent.style.display === 'none') {
                pluginContent.style.display = '';
                pluginWindow.style.height = '';
            } else {
                pluginContent.style.display = 'none';
                pluginWindow.style.height = 'auto';
            }
        });
    });
    
    document.querySelectorAll('.plugin-maximize').forEach(button => {
        button.addEventListener('click', () => {
            const pluginWindow = button.closest('.plugin-window');
            
            if (pluginWindow.style.width === '100%' && pluginWindow.style.height === '100%') {
                // Restore
                pluginWindow.style.width = '';
                pluginWindow.style.height = '';
                pluginWindow.style.left = '';
                pluginWindow.style.top = '';
                pluginWindow.style.right = '';
                pluginWindow.style.bottom = '';
            } else {
                // Maximize
                pluginWindow.style.position = 'fixed';
                pluginWindow.style.width = '100%';
                pluginWindow.style.height = '100%';
                pluginWindow.style.left = '0';
                pluginWindow.style.top = '0';
                pluginWindow.style.right = '0';
                pluginWindow.style.bottom = '0';
                pluginWindow.style.zIndex = '1001';
            }
        });
    });
    
    // Open plugin windows from browser
    document.querySelectorAll('.browser-item').forEach(item => {
        item.addEventListener('dblclick', () => {
            const itemName = item.textContent;
            
            // Hide all plugin windows first
            document.querySelectorAll('.plugin-window').forEach(window => {
                window.classList.add('hidden');
            });
            
            // Show the appropriate plugin window
            if (itemName === 'FLEX') {
                document.getElementById('flex-plugin-window').classList.remove('hidden');
            } else if (itemName === 'Fruity SoundFont Player') {
                document.getElementById('soundfont-plugin-window').classList.remove('hidden');
            } else if (itemName === 'OTT') {
                document.getElementById('ott-plugin-window').classList.remove('hidden');
            }
        });
    });
}

// Browser
function initBrowser() {
    // Toggle folder content
    document.querySelectorAll('.folder-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
        });
    });
}

// Channel Rack
function initChannelRack() {
    // Add step buttons to each channel
    document.querySelectorAll('.channel-item').forEach(channel => {
        const stepsContainer = channel.querySelector('.channel-steps');
        
        for (let i = 0; i < 16; i++) {
            const stepButton = document.createElement('div');
            stepButton.className = 'step-button';
            stepButton.dataset.step = i;
            
            // Alternate colors for groups of 4
            if (Math.floor(i / 4) % 2 === 1) {
                stepButton.style.backgroundColor = '#3a3a3a';
            }
            
            stepButton.addEventListener('click', () => {
                stepButton.classList.toggle('active');
            });
            
            stepsContainer.appendChild(stepButton);
        }
    });
    
    // Add channel button
    const addChannelButton = document.querySelector('.add-channel');
    addChannelButton.addEventListener('click', () => {
        const channelContent = document.querySelector('.channel-content');
        const newChannel = document.createElement('div');
        newChannel.className = 'channel-item';
        
        newChannel.innerHTML = `
            <div class="channel-controls">
                <div class="channel-mute">M</div>
                <div class="channel-solo">S</div>
            </div>
            <div class="channel-name" data-hint="Channel: New Channel">New Channel</div>
            <div class="channel-steps"></div>
            <div class="channel-volume">
                <div class="knob" data-hint="Channel Volume: Left-click and drag to adjust"></div>
            </div>
            <div class="channel-pan">
                <div class="knob small" data-hint="Channel Pan: Left-click and drag to adjust"></div>
            </div>
        `;
        
        // Insert before the add channel button
        channelContent.insertBefore(newChannel, addChannelButton);
        
        // Add step buttons to the new channel
        const stepsContainer = newChannel.querySelector('.channel-steps');
        for (let i = 0; i < 16; i++) {
            const stepButton = document.createElement('div');
            stepButton.className = 'step-button';
            stepButton.dataset.step = i;
            
            // Alternate colors for groups of 4
            if (Math.floor(i / 4) % 2 === 1) {
                stepButton.style.backgroundColor = '#3a3a3a';
            }
            
            stepButton.addEventListener('click', () => {
                stepButton.classList.toggle('active');
            });
            
            stepsContainer.appendChild(stepButton);
        }
        
        // Initialize knobs for the new channel
        initKnobsAndSliders();
        initHintPanel();
    });
    
    // Mute/Solo buttons
    document.querySelectorAll('.channel-mute, .channel-solo').forEach(button => {
        button.addEventListener('click', () => {
            button.classList.toggle('active');
        });
    });
}

// Mixer
function initMixer() {
    // Mute/Solo buttons
    document.querySelectorAll('.track-mute, .track-solo').forEach(button => {
        button.addEventListener('click', () => {
            button.classList.toggle('active');
        });
    });
    
    // Faders
    document.querySelectorAll('.track-fader').forEach(fader => {
        let value = 75; // Default value (0-100)
        let isDragging = false;
        let startY, startValue;
        
        // Set initial position
        updateFaderPosition(fader, value);
        
        // Mouse down event
        fader.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left click
                isDragging = true;
                startY = e.clientY;
                startValue = value;
                e.preventDefault();
            }
        });
        
        // Mouse move event (document level)
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaY = startY - e.clientY;
                const sensitivity = e.ctrlKey ? 0.5 : 1; // Fine adjustment with CTRL
                
                // Calculate new value
                let newValue = startValue + deltaY * sensitivity;
                
                // Skip snapping if SHIFT is held
                if (!e.shiftKey) {
                    // Snap to 0%, 25%, 50%, 75%, 100%
                    const snapPoints = [0, 25, 50, 75, 100];
                    for (const point of snapPoints) {
                        if (Math.abs(newValue - point) < 3) {
                            newValue = point;
                            break;
                        }
                    }
                }
                
                // Clamp value between 0 and 100
                value = Math.max(0, Math.min(100, newValue));
                
                // Update fader position
                updateFaderPosition(fader, value);
            }
        });
        
        // Mouse up event (document level)
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        // Middle click to reset
        fader.addEventListener('mousedown', (e) => {
            if (e.button === 1) { // Middle click
                value = 75; // Reset to default
                updateFaderPosition(fader, value);
                e.preventDefault();
            }
        });
        
        // ALT + Left click to reset
        fader.addEventListener('click', (e) => {
            if (e.altKey) { // ALT + Left click
                value = 75; // Reset to default
                updateFaderPosition(fader, value);
                e.preventDefault();
            }
        });
    });
}

// Helper function to update fader position
function updateFaderPosition(fader, value) {
    // Calculate position as a percentage from the bottom
    const position = value;
    fader.style.marginTop = `${100 - position}%`;
    fader.style.height = '10px';
}

// Playlist
function initPlaylist() {
    // Tool buttons
    document.querySelectorAll('.tool-button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.tool-button').forEach(b => b.classList.remove('active'));
            button.classList.add('active');
        });
    });
    
    // Zoom bar
    const zoomBar = document.querySelector('.zoom-bar');
    if (zoomBar) {
        let isDragging = false;
        let startY, startZoom;
        
        zoomBar.addEventListener('mousedown', (e) => {
            isDragging = true;
            startY = e.clientY;
            startZoom = 1; // Default zoom level
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaY = startY - e.clientY;
                const zoom = Math.max(0.5, Math.min(5, startZoom + deltaY * 0.01));
                
                // Apply zoom to playlist tracks
                document.querySelectorAll('.playlist-track').forEach(track => {
                    track.style.height = `${30 * zoom}px`;
                });
            }
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }
}

// Scrollmarsey
function initScrollmarsey() {
    const scrollmarsey = document.getElementById('scrollmarsey');
    if (!scrollmarsey) return;
    
    const walkSrc = 'https://files.catbox.moe/muw5t3.webp';
    const stopSrc = 'https://files.catbox.moe/v06ukd.webp';
    
    let lastScroll = 0;
    let isWalkingDown = true;
    let stopped = true;
    let scroll_marsey_timer_id;
    let isDragging = false;
    let lastY = 0;
    
    function walkMarsey() {
        if (stopped) {
            scrollmarsey.src = walkSrc;
            stopped = false;
        }
    }
    
    function stopMarsey() {
        if (!stopped) {
            scrollmarsey.src = stopSrc;
            stopped = true;
        }
    }
    
    function updateMarseyVerticalPosition(scrollPosition) {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollPercent = scrollPosition / (documentHeight - windowHeight);
        const marseyHeight = scrollmarsey.offsetHeight;
        const maxTop = windowHeight - marseyHeight;
        const newTop = scrollPercent * maxTop;
        
        requestAnimationFrame(() => {
            scrollmarsey.style.top = `${newTop}px`;
        });
    }
    
    function updateMarseyPosition() {
        walkMarsey();
        const scrollPosition = window.scrollY;
        const scrollDelta = scrollPosition - lastScroll;
        
        if (scrollDelta > 0 && isWalkingDown) {
            isWalkingDown = false;
            scrollmarsey.style.transform = 'scaleY(1)';
        } else if (scrollDelta < 0 && !isWalkingDown) {
            isWalkingDown = true;
            scrollmarsey.style.transform = 'scaleY(-1)';
        }
        
        updateMarseyVerticalPosition(scrollPosition);
        lastScroll = scrollPosition;
        
        clearTimeout(scroll_marsey_timer_id);
        scroll_marsey_timer_id = setTimeout(stopMarsey, 400);
    }
    
    window.addEventListener('scroll', updateMarseyPosition);
    window.addEventListener('resize', updateMarseyPosition);
    updateMarseyPosition();
    
    scrollmarsey.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastY = e.clientY;
        scrollmarsey.style.cursor = 'grabbing';
        e.preventDefault();
    });
    
    addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const deltaY = e.clientY - lastY;
        const viewportHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollMultiplier = (documentHeight - viewportHeight) / (viewportHeight * 0.8);
        
        window.scrollBy(0, deltaY * scrollMultiplier);
        lastY = e.clientY;
        e.preventDefault();
    });
    
    addEventListener('mouseup', () => {
        isDragging = false;
        scrollmarsey.style.cursor = 'grab';
    });
}

// OTT Plugin
function initOTTPlugin() {
    // Initialize OTT effect (simplified version)
    const ottPlugin = document.getElementById('ott-plugin-window');
    if (!ottPlugin) return;
    
    // Create a simple audio context for OTT processing
    let audioContext = null;
    let ottEffect = null;
    
    // Initialize audio context on first interaction
    const initAudioContext = () => {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            ottEffect = new XlethOTTEffect();
            ottEffect.prepare(audioContext.sampleRate, 4096);
        }
    };
    
    // Initialize OTT parameters
    const ottParameters = {
        depth: 70,
        time: 50,
        xover_low: 88,
        xover_high: 2500,
        gain_low: 0,
        gain_mid: 0,
        gain_high: 0
    };
    
    // Update OTT effect when parameters change
    const updateOTTParameters = () => {
        if (ottEffect) {
            ottEffect.setParameter('depth', ottParameters.depth);
            ottEffect.setParameter('time', ottParameters.time);
            ottEffect.setParameter('xover_low', ottParameters.xover_low);
            ottEffect.setParameter('xover_high', ottParameters.xover_high);
            ottEffect.setParameter('gain_low', ottParameters.gain_low);
            ottEffect.setParameter('gain_mid', ottParameters.gain_mid);
            ottEffect.setParameter('gain_high', ottParameters.gain_high);
        }
    };
    
    // Update OTT meters
    const updateOTTMeters = () => {
        if (ottEffect) {
            const meterL = ottEffect.getMeterValue(0);
            const meterR = ottEffect.getMeterValue(1);
            const grLow = ottEffect.getMeterValue(2);
            const grMid = ottEffect.getMeterValue(3);
            const grHigh = ottEffect.getMeterValue(4);
            
            // Update meter displays
            const meterLFill = ottPlugin.querySelector('.ott-meter:first-child .meter-fill');
            const meterRFill = ottPlugin.querySelector('.ott-meter:last-child .meter-fill');
            const grLowFill = ottPlugin.querySelector('.band-meter:first-child .band-meter-fill');
            const grMidFill = ottPlugin.querySelector('.band-meter:nth-child(2) .band-meter-fill');
            const grHighFill = ottPlugin.querySelector('.band-meter:last-child .band-meter-fill');
            
            if (meterLFill) meterLFill.style.width = `${meterL * 100}%`;
            if (meterRFill) meterRFill.style.width = `${meterR * 100}%`;
            if (grLowFill) grLowFill.style.width = `${grLow * 100}%`;
            if (grMidFill) grMidFill.style.width = `${grMid * 100}%`;
            if (grHighFill) grHighFill.style.width = `${grHigh * 100}%`;
        }
        
        requestAnimationFrame(updateOTTMeters);
    };
    
    // Start meter updates when OTT plugin is opened
    const observer = new MutationObserver(() => {
        if (!ottPlugin.classList.contains('hidden')) {
            initAudioContext();
            updateOTTMeters();
        }
    });
    
    observer.observe(ottPlugin, { attributes: true, attributeFilter: ['class'] });
    
    // Add event listeners to OTT knobs
    ottPlugin.querySelectorAll('.knob').forEach(knob => {
        const paramName = knob.parentElement.querySelector('.parameter-label').textContent;
        
        // Add a custom event listener to update OTT parameters
        knob.addEventListener('ott-value-change', (e) => {
            const value = e.detail.value;
            
            if (paramName.includes('Depth')) {
                ottParameters.depth = value;
            } else if (paramName.includes('Time')) {
                ottParameters.time = value;
            } else if (paramName.includes('X-Over Low')) {
                // Convert percentage to frequency (40-400 Hz)
                ottParameters.xover_low = 40 * Math.pow(10, (value / 100) * Math.log10(400 / 40));
            } else if (paramName.includes('X-Over High')) {
                // Convert percentage to frequency (1000-8000 Hz)
                ottParameters.xover_high = 1000 * Math.pow(10, (value / 100) * Math.log10(8000 / 1000));
            } else if (paramName.includes('Gain Low')) {
                // Convert percentage to dB (-12 to +12 dB)
                ottParameters.gain_low = (value / 100) * 24 - 12;
            } else if (paramName.includes('Gain Mid')) {
                // Convert percentage to dB (-12 to +12 dB)
                ottParameters.gain_mid = (value / 100) * 24 - 12;
            } else if (paramName.includes('Gain High')) {
                // Convert percentage to dB (-12 to +12 dB)
                ottParameters.gain_high = (value / 100) * 24 - 12;
            }
            
            updateOTTParameters();
        });
    });
    
    // Modify the knob dragging to dispatch custom event
    const originalInitKnobsAndSliders = initKnobsAndSliders;
    initKnobsAndSliders = function() {
        originalInitKnobsAndSliders();
        
        // Add event listeners to OTT knobs
        ottPlugin.querySelectorAll('.knob').forEach(knob => {
            let value = 50;
            let isDragging = false;
            let startY, startValue;
            
            // Mouse down event
            knob.addEventListener('mousedown', (e) => {
                if (e.button === 0) { // Left click
                    isDragging = true;
                    startY = e.clientY;
                    startValue = value;
                    e.preventDefault();
                }
            });
            
            // Mouse move event (document level)
            document.addEventListener('mousemove', (e) => {
                if (isDragging) {
                    const deltaY = startY - e.clientY;
                    const sensitivity = e.ctrlKey ? 0.5 : 2;
                    
                    let newValue = startValue + deltaY * sensitivity;
                    
                    if (!e.shiftKey) {
                        const snapPoints = [0, 25, 50, 75, 100];
                        for (const point of snapPoints) {
                            if (Math.abs(newValue - point) < 3) {
                                newValue = point;
                                break;
                            }
                        }
                    }
                    
                    value = Math.max(0, Math.min(100, newValue));
                    updateKnobRotation(knob, value);
                    
                    // Dispatch custom event
                    knob.dispatchEvent(new CustomEvent('ott-value-change', {
                        detail: { value }
                    }));
                }
            });
            
            // Mouse up event (document level)
            document.addEventListener('mouseup', () => {
                isDragging = false;
            });
        });
    };
}

// SoundFont Player
function initSoundFontPlayer() {
    const soundfontPlugin = document.getElementById('soundfont-plugin-window');
    if (!soundfontPlugin) return;
    
    const loadButton = soundfontPlugin.querySelector('.load-button');
    const soundfontName = soundfontPlugin.querySelector('.soundfont-name');
    const patchesList = soundfontPlugin.querySelector('.patches-list');
    
    // Load SoundFont file
    loadButton.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.sf2,.sf3,.sf4';
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                soundfontName.textContent = file.name;
                
                // In a real implementation, we would parse the SoundFont file here
                // For this simulation, we'll just add some fake patches
                patchesList.innerHTML = '';
                
                const fakePatches = [
                    'Piano',
                    'Electric Piano',
                    'Organ',
                    'Guitar',
                    'Bass',
                    'Strings',
                    'Brass',
                    'Woodwinds',
                    'Pad',
                    'Lead'
                ];
                
                fakePatches.forEach(patch => {
                    const patchItem = document.createElement('div');
                    patchItem.className = 'patch-item';
                    patchItem.textContent = patch;
                    
                    patchItem.addEventListener('click', () => {
                        soundfontPlugin.querySelector('.soundfont-patch').textContent = patch;
                        patchesList.querySelectorAll('.patch-item').forEach(p => p.classList.remove('active'));
                        patchItem.classList.add('active');
                    });
                    
                    patchesList.appendChild(patchItem);
                });
            }
        });
        
        input.click();
    });
}

// FLEX Plugin
function initFLEXPlugin() {
    const flexPlugin = document.getElementById('flex-plugin-window');
    if (!flexPlugin) return;
    
    // Preset tabs
    const presetTabs = flexPlugin.querySelectorAll('.preset-tab');
    presetTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            presetTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // In a real implementation, we would load different preset views here
            // For this simulation, we'll just change the active tab
        });
    });
    
    // Preset packs
    const presetPacks = flexPlugin.querySelectorAll('.preset-pack');
    presetPacks.forEach(pack => {
        pack.addEventListener('click', () => {
            presetPacks.forEach(p => p.classList.remove('active'));
            pack.classList.add('active');
            
            // In a real implementation, we would load presets for the selected pack here
            // For this simulation, we'll just change the active pack
        });
    });
    
    // Presets
    const presetItems = flexPlugin.querySelectorAll('.preset-item');
    presetItems.forEach(preset => {
        preset.addEventListener('click', () => {
            presetItems.forEach(p => p.classList.remove('active'));
            preset.classList.add('active');
            
            // In a real implementation, we would load the selected preset here
            // For this simulation, we'll just change the active preset
        });
    });
    
    // Preset navigation
    const prevPreset = flexPlugin.querySelector('.preset-nav-prev');
    const nextPreset = flexPlugin.querySelector('.preset-nav-next');
    
    prevPreset.addEventListener('click', () => {
        const activePreset = flexPlugin.querySelector('.preset-item.active');
        if (activePreset) {
            const prevItem = activePreset.previousElementSibling;
            if (prevItem && prevItem.classList.contains('preset-item')) {
                presetItems.forEach(p => p.classList.remove('active'));
                prevItem.classList.add('active');
                prevItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    });
    
    nextPreset.addEventListener('click', () => {
        const activePreset = flexPlugin.querySelector('.preset-item.active');
        if (activePreset) {
            const nextItem = activePreset.nextElementSibling;
            if (nextItem && nextItem.classList.contains('preset-item')) {
                presetItems.forEach(p => p.classList.remove('active'));
                nextItem.classList.add('active');
                nextItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    });
    
    // Analysis display
    const analysisDisplay = flexPlugin.querySelector('.flex-analysis');
    let displayMode = 0;
    const displayModes = ['Waveform', 'Spectrogram', 'Vectorscope', 'Frequency histogram'];
    
    analysisDisplay.addEventListener('dblclick', () => {
        displayMode = (displayMode + 1) % displayModes.length;
        
        // In a real implementation, we would change the analysis display mode here
        // For this simulation, we'll just update the hint
        analysisDisplay.setAttribute('data-hint', `Analysis: ${displayModes[displayMode]}`);
        initHintPanel(); // Refresh hints
    });
    
    // Effect type selectors
    const effectTypes = flexPlugin.querySelectorAll('.effect-type');
    effectTypes.forEach(effectType => {
        effectType.addEventListener('click', () => {
            const effectName = effectType.parentElement.querySelector('.effect-header').textContent;
            
            // Different filter types for the filter effect
            if (effectName === 'Filter') {
                const filterTypes = ['LP 6', 'LP 12', 'LP 12 Alt', 'LP 24', 'LP 24 Alt', 'HP 6', 'HP 12', 'HP 12 Alt', 'HP 24', 'BP 12', 'BP 12 Alt', 'Low shelf', 'High shelf', 'Notch', 'Peak', 'Phaser 1', 'Phaser 2', 'Phaser 3', 'Vowel', 'Comb+', 'Comb-', 'All pass'];
                const currentType = effectType.textContent;
                const currentIndex = filterTypes.indexOf(currentType);
                const nextIndex = (currentIndex + 1) % filterTypes.length;
                effectType.textContent = filterTypes[nextIndex];
            }
            // Different limiter types
            else if (effectName === 'Limiter') {
                const limiterTypes = ['Custom', 'Limiter', 'Warming', 'Heating', 'Distortion'];
                const currentType = effectType.textContent;
                const currentIndex = limiterTypes.indexOf(currentType);
                const nextIndex = (currentIndex + 1) % limiterTypes.length;
                effectType.textContent = limiterTypes[nextIndex];
            }
        });
    });
    
    // Pitch controls
    const pitchButtons = flexPlugin.querySelectorAll('.pitch-button');
    const pitchDisplay = flexPlugin.querySelector('.pitch-display');
    let pitchValue = 0;
    
    pitchButtons[0].addEventListener('click', () => {
        // Decrease pitch
        pitchValue = Math.max(-24, pitchValue - 1);
        pitchDisplay.textContent = `${pitchValue} st`;
    });
    
    pitchButtons[1].addEventListener('click', () => {
        // Increase pitch
        pitchValue = Math.min(24, pitchValue + 1);
        pitchDisplay.textContent = `${pitchValue} st`;
    });
    
    // Preset menu
    const presetMenu = flexPlugin.querySelector('.preset-menu');
    presetMenu.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        
        // Create a custom context menu for presets
        const menu = document.createElement('div');
        menu.style.position = 'fixed';
        menu.style.left = `${e.clientX}px`;
        menu.style.top = `${e.clientY}px`;
        menu.style.backgroundColor = '#2d2d2d';
        menu.style.border = '1px solid #555';
        menu.style.borderRadius = '3px';
        menu.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.5)';
        menu.style.zIndex = '2000';
        menu.style.minWidth = '180px';
        menu.style.padding = '5px 0';
        
        const menuItems = [
            'Save preset as...',
            'Rename preset',
            'Delete preset',
            'Copy preset to...',
            'Initialize preset',
            'Show preset folder'
        ];
        
        menuItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.textContent = item;
            menuItem.style.padding = '5px 15px';
            menuItem.style.fontSize = '11px';
            menuItem.style.cursor = 'pointer';
            
            menuItem.addEventListener('mouseover', () => {
                menuItem.style.backgroundColor = '#ff7700';
            });
            
            menuItem.addEventListener('mouseout', () => {
                menuItem.style.backgroundColor = '';
            });
            
            menuItem.addEventListener('click', () => {
                // In a real implementation, we would handle these actions
                document.body.removeChild(menu);
            });
            
            menu.appendChild(menuItem);
        });
        
        document.body.appendChild(menu);
        
        // Remove menu on click anywhere
        const removeMenu = () => {
            if (document.body.contains(menu)) {
                document.body.removeChild(menu);
            }
            document.removeEventListener('click', removeMenu);
        };
        
        setTimeout(() => {
            document.addEventListener('click', removeMenu);
        }, 0);
    });
}

// XlethOTTEffect class (simplified version for web)
class XlethOTTEffect {
    constructor() {
        this.sampleRate = 44100;
        this.params = {
            depth: 70,
            time: 50,
            xover_low: 88,
            xover_high: 2500,
            gain_low: 0,
            gain_mid: 0,
            gain_high: 0
        };
        this.meters = [0, 0, 0, 0, 0];
    }
    
    prepare(sampleRate, maxBlockSize) {
        this.sampleRate = sampleRate;
    }
    
    setParameter(name, value) {
        if (this.params.hasOwnProperty(name)) {
            this.params[name] = value;
        }
    }
    
    getParameter(name) {
        return this.params[name] || 0;
    }
    
    getMeterValue(index) {
        return this.meters[index] || 0;
    }
    
    // Simplified process method for demo purposes
    process(inputChannels, outputChannels, numSamples) {
        // In a real implementation, this would apply the OTT effect
        // For this simulation, we'll just generate some fake meter values
        const time = Date.now() / 1000;
        this.meters[0] = 0.5 + 0.3 * Math.sin(time * 2);
        this.meters[1] = 0.5 + 0.3 * Math.sin(time * 2.1);
        this.meters[2] = 0.3 + 0.2 * Math.sin(time * 1.5);
        this.meters[3] = 0.4 + 0.2 * Math.sin(time * 1.7);
        this.meters[4] = 0.3 + 0.2 * Math.sin(time * 1.9);
    }
}
