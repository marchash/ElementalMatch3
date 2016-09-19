/*
 * The main application file, your game code begins here.
 */

// devkit imports
import device as Device;
import ui.StackView as StackView;
// user imports
import src.TitleScreen as TitleScreen;
import src.GameScreen as GameScreen;

/* Your application inherits from GC.Application, which is
 * exported and instantiated when the game is run.
 */
exports = Class(GC.Application, function () {

 /* Run after the engine is created and the scene graph is in
  * place, but before the resources have been loaded.
  */
  this.initUI = function () {
    var titlescreen = new TitleScreen(),
        gamescreen = new GameScreen();

    var rootView = new StackView({
      superview: this,
      x: 0,
      y: 0,
      width: Device.screen.width,
      height: Device.screen.height,
      clip: true
    });

    rootView.push(titlescreen);

   /* Listen for an event dispatched by the title screen when
    * the start button has been pressed. Hide the title screen,
    * show the game screen, then dispatch a custom event to the
    * game screen to start the game.
    */
    titlescreen.on('titlescreen:start', function () {
      rootView.push(gamescreen);
      gamescreen.emit('app:start');
    });

   /* When the game screen has signalled that the game is over,
    * show the title screen so that the user may play the game again.
    */
    gamescreen.on('gamescreen:end', function () {

      gamescreen.scores.push(gamescreen.score);

      titlescreen.scoreView.setText("Your Final Score: " + gamescreen.score);

      rootView.pop();
    });
  };

 /* Executed after the asset resources have been loaded.
  * If there is a splash screen, it's removed.
  */
  this.launchUI = function () {};
});