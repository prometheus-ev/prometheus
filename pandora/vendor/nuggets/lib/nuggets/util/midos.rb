require 'nuggets/midos'
module Util; Midos = ::Nuggets::Midos; end

warn "#{__FILE__}: Util::Midos is deprecated, use Nuggets::Midos instead." unless ENV['NUGGETS_DEPRECATED_UTIL_MIDOS']
