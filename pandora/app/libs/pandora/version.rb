module Pandora
  module Version
    MAJOR = 4
    MINOR = 0
    TINY  = 0

    class << self
      # Returns array representation.
      def to_a
        [MAJOR, MINOR, TINY]
      end

      # Short-cut for version string.
      def to_s
        to_a.join('.')
      end
    end
  end
end
