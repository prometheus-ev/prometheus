require 'nuggets/mysql'
module Util; MySQL = ::Nuggets::MySQL; end

warn "#{__FILE__}: Util::MySQL is deprecated, use Nuggets::MySQL instead." unless ENV['NUGGETS_DEPRECATED_UTIL_MYSQL']
