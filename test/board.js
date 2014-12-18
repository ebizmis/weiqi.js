var should = require('chai').should();
var expect = require('chai').expect;
var Weiqi = require('../index.js');
var Board = Weiqi.Board;

describe("Board", function() {
  describe('#createBoard', function() {
    it('creates a board of size 9', function() {
      var board = Board.createBoard(9);
      board.getSize().should.equal(9);
    });

    it('creates a board of size 13', function() {
      var board = Board.createBoard(13);
      board.getSize().should.equal(13);
    });

    it('creates a board of size 19', function() {
      var board = Board.createBoard(19);
      board.getSize().should.equal(19);
    });

    it('should start off empty', function() {
      var board = Board.createBoard(9);
      var i, j;
      for (i = 0; i < 9; i++)
        for (j = 0; j < 9; j++)
          board.getStone([i, j]).should.equal(Weiqi.EMPTY);
    });
  });

  describe('#play', function() {
    it('should allow inner coords', function() {
      var i, j, board;
      var board = Board.createBoard(9);
      for (i = 0; i < 9; i++)
        for (j = 0; j < 9; j++) {
          board
            .play(Weiqi.BLACK, [i, j])
           .getStone([i, j]).should.equal(Weiqi.BLACK);
        }
    });

    it('should reject out of bounds coords', function() {
      var positions = [[-1, 0], [0, -1], [-1, -1], [9, 0], [0, 9], [9, 9]];
      positions.forEach(function(position) {
        var fn = function() {
          return Board.createBoard(9).play(Weiqi.BLACK, positions);
        };
        expect(fn).to.throw("Intersection out of bounds");
      });
    });

    it('should reject occupied intersections', function() {
      var fn = function() {
        Board.createBoard(9)
          .play(Weiqi.BLACK, [0, 0])
          .play(Weiqi.WHITE, [0, 0]);
      };
      expect(fn).to.throw("Intersection occupied by existing stone");
    });

    it('should set the correct stone color', function() {
      Board.createBoard(4)
        .play(Weiqi.BLACK, [0, 0])
        .toString().should.equal("x...\n....\n....\n....");

      Board.createBoard(4)
        .play(Weiqi.WHITE, [3, 2])
        .toString().should.equal("....\n....\n....\n..o.");
    });

    it('should capture stones in the corner', function() {
      var board = Board.createBoard(4)
                    .play(Weiqi.BLACK, [0, 0])
                    .play(Weiqi.BLACK, [0, 1])
                    .play(Weiqi.BLACK, [1, 0]);

      board.toString().should.equal("xx..\nx...\n....\n....");

      board = board
        .play(Weiqi.WHITE, [0, 2])
        .play(Weiqi.WHITE, [1, 1]);

      board.toString().should.equal("xxo.\nxo..\n....\n....");
      board = board.play(Weiqi.WHITE, [2, 0]);
      board.toString().should.equal("..o.\n.o..\no...\n....");
    });

    it('should capture stones on the side', function() {
      var board = Board.createBoard(4)
                    .play(Weiqi.BLACK, [1, 3])
                    .play(Weiqi.BLACK, [1, 2]);

      board.toString().should.equal("....\n..xx\n....\n....");

      board = board
        .play(Weiqi.WHITE, [1, 1])
        .play(Weiqi.WHITE, [0, 3])
        .play(Weiqi.WHITE, [0, 2])
        .play(Weiqi.WHITE, [2, 3]);

      board.toString().should.equal("..oo\n.oxx\n...o\n....");
      board = board.play(Weiqi.WHITE, [2, 2]);
      board.toString().should.equal("..oo\n.o..\n..oo\n....");
    });

    it('should capture stones in the middle', function() {
      var board = Board.createBoard(4)
                    .play(Weiqi.BLACK, [1, 1])
                    .play(Weiqi.BLACK, [1, 2]);

      board.toString().should.equal("....\n.xx.\n....\n....");

      board = board
        .play(Weiqi.WHITE, [0, 2])
        .play(Weiqi.WHITE, [1, 0])
        .play(Weiqi.WHITE, [1, 3])
        .play(Weiqi.WHITE, [2, 1])
        .play(Weiqi.WHITE, [2, 2]);

      board.toString().should.equal("..o.\noxxo\n.oo.\n....");
      board = board.play(Weiqi.WHITE, [0, 1]);
      board.toString().should.equal(".oo.\no..o\n.oo.\n....");
    });

    it('should allow suicide of one stone', function() {
      var board = Board.createBoard(4)
                    .play(Weiqi.BLACK, [0, 1])
                    .play(Weiqi.BLACK, [1, 2])
                    .play(Weiqi.BLACK, [2, 1])
                    .play(Weiqi.BLACK, [1, 0]);

      board.toString().should.equal(".x..\nx.x.\n.x..\n....");
      board = board.play(Weiqi.WHITE, [1, 1]);
      board.toString().should.equal(".x..\nx.x.\n.x..\n....");
    });

    it('should allow suicide of many stones', function() {
      var board = Board.createBoard(4)
                    .play(Weiqi.BLACK, [0, 1])
                    .play(Weiqi.BLACK, [0, 2])
                    .play(Weiqi.BLACK, [1, 3])
                    .play(Weiqi.BLACK, [2, 2])
                    .play(Weiqi.BLACK, [2, 1])
                    .play(Weiqi.BLACK, [1, 0]);

      board.toString().should.equal(".xx.\nx..x\n.xx.\n....");
      board = board.play(Weiqi.WHITE, [1, 1]);
      board.toString().should.equal(".xx.\nxo.x\n.xx.\n....");
      board = board.play(Weiqi.WHITE, [1, 2]);
      board.toString().should.equal(".xx.\nx..x\n.xx.\n....");
    });

    it('should evaluate enemy liberties before player liberties', function() {
      var board = Board.createBoard(4)
                    .play(Weiqi.BLACK, [0, 1])
                    .play(Weiqi.WHITE, [0, 2])
                    .play(Weiqi.BLACK, [1, 2])
                    .play(Weiqi.WHITE, [1, 3])
                    .play(Weiqi.BLACK, [2, 1])
                    .play(Weiqi.WHITE, [2, 2])
                    .play(Weiqi.BLACK, [1, 0]);
      board.toString().should.equal(".xo.\nx.xo\n.xo.\n....");
      board = board.play(Weiqi.WHITE, [1, 1]);
      board.toString().should.equal(".xo.\nxo.o\n.xo.\n....");
    });
  });
});
