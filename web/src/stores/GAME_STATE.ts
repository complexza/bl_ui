import { Send } from '@enums/events';
import { TGameParams, TGameState } from '@typings/gameState';
import { SendEvent } from '@utils/eventsHandlers';
import { Writable, writable } from 'svelte/store';
import win from '@assets/confirmation_001.ogg';
import lose from '@assets/question_002.ogg';
import start from '@assets/maximize_006.ogg';
import finish from '@assets/minimize_006.ogg';
import click1 from '@assets/drop_003.ogg';
import iteration from '@assets/drop_004.ogg';
import click2 from '@assets/drop_002.ogg';
import scroll from '@assets/scroll_002.ogg';

const GAME_SOUNDS = {
    win: new Audio(win),
    lose: new Audio(lose),
    start: new Audio(start),
    finish: new Audio(finish),
    primary: new Audio(click1),
    secondary: new Audio(click2),
    iteration: new Audio(iteration),
    scroll: new Audio(scroll),
};

let playingScrollSound = false;

function replaySound() {
    if (playingScrollSound) {
        GAME_SOUNDS.scroll.currentTime = 0;
        GAME_SOUNDS.scroll.play();
    }
}

export const store = () => {
    const GAME_STATE: Writable<Partial<TGameState>> = writable<
        Partial<TGameState>
    >({
        active: false,
    });

    const methods = {
        start: (data: TGameParams) => {
            let { type, iterations, config } = data;

            iterations = iterations || 1;

            GAME_SOUNDS.start.volume = 0.5;
            GAME_SOUNDS.start.play();

            GAME_STATE.update(_ => {
                const active = true;
                return {
                    active,
                    type,
                    iterations,
                    config,
                };
            });
        },

        finish: (success: boolean = false) => {
            GAME_SOUNDS.finish.volume = 0.5;
            GAME_SOUNDS.finish.play();
            GAME_STATE.update(store => {
                SendEvent(Send.finish, success);
                const active = false;
                return {
                    active,
                };
            });
        },

        scroll: (bool: boolean) => {
            GAME_SOUNDS.scroll.volume = 0.05;
            // play at 2x speed
            GAME_SOUNDS.scroll.playbackRate = 1.5;
            if (bool && !playingScrollSound) {
                GAME_SOUNDS.scroll.play();
                // Ensure that the sound does not loop automatically
                GAME_SOUNDS.scroll.loop = false;

                // Listen for the 'ended' event to manually replay the sound
                GAME_SOUNDS.scroll.addEventListener('ended', replaySound);
            } else if (!bool && playingScrollSound) {
                // Pause and reset the sound, stop replay
                GAME_SOUNDS.scroll.pause();
                GAME_SOUNDS.scroll.currentTime = 0;

                // Remove the 'ended' event listener to stop looping
                GAME_SOUNDS.scroll.removeEventListener('ended', replaySound);
            }

            playingScrollSound = bool;
        },

        playSound: (sound: keyof typeof GAME_SOUNDS) => {
            const _sound = GAME_SOUNDS[sound];
            _sound.volume = 0.5;
            _sound.currentTime = 0;
            _sound.play();
        },
    };

    return {
        ...GAME_STATE,
        ...methods,
    };
};

export default store();
